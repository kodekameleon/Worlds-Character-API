require("./init-env").init();
const fs = require("fs");
const path = require("path");
const {dynamodb, dbclient} = require("../dist/service").connect;

async function migrate() {
  const files = fs.readdirSync("migrations");
  files.sort();

  try {
    for (const file of files) {
      if (/^.*\.js$/.test(file)) {
        const migration = require(path.resolve("migrations", file));
        if (migration.migrate) {
          console.log("________________________________________________________");
          console.log(`Migrate: ${file}`);
          await migration.migrate({dynamodb, helpers});
        }
      }
    }
  } catch(err) {
    console.log(err);
    process.exit(1);
  }
}

const helpers = {
  getTableVersion: async (tableName) => {
    let version = {};
    try {
      const res = await dbclient.query({
        TableName: "worlds-schema",
        KeyConditionExpression: "tableName = :name",
        ExpressionAttributeValues: {":name": tableName}
      }).promise();
      if (res && Array.isArray(res.Items) && res.Items.length > 0) {
        version = res.Items[0];
      }
    } catch (err) {
      if (err.code !== "ResourceNotFoundException") {
        throw err;
      }

      // The schema table does not exist, create it now.
      await createSchemaTable();
    }

    // Check if the table exists, if it does not reset the table version
    try {
      await dynamodb.describeTable({TableName: tableName}).promise();
    } catch (err) {
      console.log(`Table ${tableName} has been deleted, reset table version`);
      version = {};
      helpers.setTableVersion(tableName, 0);
    }

    return version;
  },

  setTableVersion: async (tableName, version) => {
    await dbclient.update({
      TableName: "worlds-schema",
      Key: {tableName},
      UpdateExpression: "set version = :version, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":version": version,
        ":updatedAt": new Date().toISOString()
      }
    }).promise();
  },

  createStandardTable: async (tableName) => {
    await dynamodb.createTable({
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: "accountId",
          KeyType: "HASH"
        },
        {
          AttributeName: "uniqueId",
          KeyType: "RANGE"
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: "accountId",
          AttributeType: "S"
        },
        {
          AttributeName: "uniqueId",
          AttributeType: "S"
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    }).promise();
  },
};

async function createSchemaTable() {
  console.log("Create the schema table");
  return dynamodb.createTable({
    TableName: "worlds-schema",
    KeySchema: [
      {
        AttributeName: "tableName",
        KeyType: "HASH"
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: "tableName",
        AttributeType: "S"
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  }).promise();
}

return migrate();
