require("./init-env").init();
const AWS = require("aws-sdk");
const packagejson = require("../package");
const Zip = require("adm-zip");
const openapi = require("../src/api.json");

// TODO: Add CORS configuration

module.exports = {
  deployAPI,
  deployLambdaFunction
};

const serviceName = openapi.info.title;

let awslambda;
let awsapigw;
let awssts;

doDeploy();

async function doDeploy() {
  try {
    AWS.config.update({
      region: "ap-southeast-2"
    });

    awslambda = new AWS.Lambda();
    awsapigw = new AWS.ApiGatewayV2();
    awssts = new AWS.STS();

    await deployLambdaFunction("./dist/", packagejson.lambda);
    await deployAPI(packagejson.awsApi);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

async function deployAPI(settings) {
  const accountInfo = await awssts.getCallerIdentity({}).promise();

  // Find the lambda function running the service
  const lambdas = await awslambda.listFunctions({}).promise();
  const lambda = lambdas.Functions.find(l => l.FunctionName === serviceName);
  if (!lambda) {
    console.log(`Unable to find lambda function ${settings.lambda}`);
    return;
  }

  // Find the API, if it already exists
  const apis = await awsapigw.getApis({MaxResults: "1000"}).promise();
  let api = apis.Items.find(v => v.Name === serviceName);
  if (!api) {
    // Import the open API file, this will create a new API
    console.log("Import OpenAPI spec to create the API");
    api = await awsapigw.importApi({
      Body: JSON.stringify(openapi),
      FailOnWarnings: true
    }).promise();
  } else {
    // Reimport the open API file, this will clean up all of the routes
    console.log("Import OpenAPI spec to update the API");
    api = await awsapigw.reimportApi({
      ApiId: api.ApiId,
      Body: JSON.stringify(openapi),
      FailOnWarnings: true
    }).promise();
  }

  // Find existing lambda integrations and delete them
  const integrations = await awsapigw.getIntegrations({ApiId: api.ApiId}).promise();
  for (const i of integrations.Items) {
    if (i.IntegrationUri === lambda.FunctionArn) {
      console.log(`Delete existing integration ${i.IntegrationId} => ${i.IntegrationUri}`);
      await awsapigw.deleteIntegration({
        ApiId: api.ApiId,
        IntegrationId: i.IntegrationId
      }).promise();
    }
  }

  // Create a new integration with the lambda function
  const integration = await awsapigw.createIntegration({
    ApiId: api.ApiId,
    IntegrationType: "AWS_PROXY",
    ConnectionType: "INTERNET",
    IntegrationUri: lambda.FunctionArn,
    PayloadFormatVersion: "2.0"
  }).promise();

  // Add a permission to the lambda function if it is not already present
  const permName = `apigateway-${api.ApiId}`;
  let policy, permission;
  try {
    policy = await awslambda.getPolicy({FunctionName: serviceName}).promise();
    permission = JSON.parse(policy.Policy).Statement.find(s => s.Sid === permName);
  } catch (err) {
    if (err.code !== "ResourceNotFoundException") {
      throw err;
    }
  }
  if (!permission) {
    console.log("Add permission to lambda function so api gateway call execute it");
    await awslambda.addPermission({
      Action: "lambda:InvokeFunction",
      FunctionName: serviceName,
      Principal: "apigateway.amazonaws.com",
      SourceArn: `arn:aws:execute-api:${AWS.config.region}:${accountInfo.Account}:${api.ApiId}/*`,
      StatementId: permName
    }).promise();
  }

  // Apply the integration to every route
  console.log("Update the routes");
  const routes = await awsapigw.getRoutes({
    ApiId: api.ApiId
  }).promise();
  for (const route of routes.Items) {
    await awsapigw.updateRoute({
      ...route,
      ApiId: api.ApiId,
      Target: `integrations/${integration.IntegrationId}`
    }).promise();
  }

  // Create a stage
  const stages = await awsapigw.getStages({ApiId: api.ApiId}).promise();
  let stage = stages.Items.find(s => s.StageName === settings.stage);
  if (!stage) {
    const logSettings = {};
    if (settings.logGroup && settings.logFormat) {
      logSettings.AccessLogSettings = {
        DestinationArn: settings.logGroup,
        Format: settings.logFormat
      };
    }
    stage = await awsapigw.createStage({
      ApiId: api.ApiId,
      StageName: settings.stage,
      AutoDeploy: false,
    }).promise();
  }

  // If there is a domain create a mapping to it
  if (settings.domain) {
    const mappings = await awsapigw.getApiMappings({DomainName: settings.domain}).promise();
    const mapping = mappings.Items.find(m => m.ApiId === api.ApiId);
    if (!mapping) {
      console.log("Create a mapping to the domain");
      await awsapigw.createApiMapping({
        ApiId: api.ApiId,
        DomainName: settings.domain,
        Stage: settings.stage
      }).promise();
    }
  }

  // Create a deployment for the API and the stage to do the deployment
  console.log("Deploy the API");
  const deployment = await awsapigw.createDeployment({
    ApiId: api.ApiId,
    Description: "Blah blah about the deployment",
    StageName: settings.stage
  }).promise();

  // Delete previous deployments
  const deployments = await awsapigw.getDeployments({ApiId: api.ApiId}).promise();
  for (const d of deployments.Items) {
    if (d.DeploymentId !== deployment.DeploymentId) {
      console.log(`Delete old deployment ${d.DeploymentId}`);
      await awsapigw.deleteDeployment({
        ApiId: api.ApiId,
        DeploymentId: d.DeploymentId
      }).promise();
    }
  }
}

async function deployLambdaFunction(sourcePath, settings) {
  console.log(`Deploy ${sourcePath} to lambda function ${serviceName}`);

  // Zip the distribution
  const zip = new Zip();
  zip.addLocalFolder(sourcePath, "");

  // Get the lambda function if it already exists
  let func;
  try {
    func = await awslambda.getFunction({FunctionName: serviceName}).promise();
  } catch (err) {
    if (err.code !== "ResourceNotFoundException") {
      console.log(err);
      return;
    }
  }

  try {
    if (func) {
      // Update and publish the code for the function
      console.log(`Update lambda function ${serviceName}`);
      await awslambda.updateFunctionCode({
        FunctionName: serviceName,
        ZipFile: zip.toBuffer(),
        Publish: true
      }).promise();
    } else {
      // Create the lambda function if it does not already exist
      console.log(`Create lambda function ${serviceName}`);
      await awslambda.createFunction({
        FunctionName: serviceName,
        Runtime: "nodejs12.x",
        Role: settings.role,
        Handler: settings.handler,
        Code: {
          ZipFile: zip.toBuffer()
        },
        Publish: true
      }).promise();
    }
  } catch (err) {
    console.log("Error publishing lambda function");
    console.log(err);
    return;
  }
}
