const AWS = require("aws-sdk");
const packagejson = require("../package");

module.exports = {
  init: () => {
    process.env.CI || require("dotenv").config();
    if (process.env.CI) {
      AWS.config.credentials = new AWS.EnvironmentCredentials(packagejson.aws.profile);
    } else {
      AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: packagejson.aws.profile});
    }
  }
};
