const http = require("http");
const url = require("url");
const uuid = require("uuid").v4;
const qs = require("qs");
const Enforcer = require("openapi-enforcer");
const packagejson = require("../package");
const api = require("../src/api.json");
const AWS = require("aws-sdk");

AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: packagejson.server.profile});

const server = http.createServer(async (request, response) => {
  const event = await generateEvent(request);

  const service = require("../dist/service");
  const res = await service.handler(event);
  response.statusCode = res.statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(res.body);
});

server.listen(packagejson.server.port || 8001, packagejson.server.host || "localhost", () => {
  console.log("Server running");
});

async function generateEvent(request) {
  const uri = url.parse(`http://${request.headers.host}${request.url}`);

  const queryParams = qs.parse(uri.query);
  Object.keys(queryParams).forEach((key) => {
    if (Array.isArray(queryParams[key])) {
      queryParams[key] = queryParams[key].join(",");
    }
  });

  const route = await matchRoute(api, request.method, uri.pathname);

  const event = {
    routeKey: route.routeKey,
    rawPath: uri.pathname,
    rawQueryString: uri.query,
    headers: request.headers,
    queryStringParameters: queryParams,
    requestContext: {
      accountId: "123123123012",
      apiId: "xx144umcpc",
      domainName: uri.hostname,
      domainPrefix: "xx144umcpc",
      http: {
        method: request.method,
        path: uri.pathname,
        protocol: "HTTP/1.1",
        sourceIp: request.socket.localAddress,
        userAgent: request.headers["user-agent"]
      },
      requestId: `${uuid()}`,
      routeKey: route.routeKey,
      stage: "localhost"
    },
    pathParameters: route.pathParameters,
    body: "",
    isBase64Encoded: false
  };

  request.on("data", (chunk) => {
    event.body += chunk.toString("utf8");
  });

  return await new Promise((resolve) => {
    request.on("end", () => resolve(event));
  });
}

async function matchRoute(api, method, path) {
  const enf = await Enforcer(api);
  const res = enf.path(method, path);
  return {pathParameters: res.value.params, routeKey: `${method} ${res.value.pathKey}`};
}
