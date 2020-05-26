import {dynamodb} from "../connect";
import {service} from "../kameleon-web";

service["GET /{apiVersion}/races/{raceId}"] = getRace;
async function getRace(event) {
  console.log(event);

  return dynamodb.query({
    TableName : "Movies",
    ProjectionExpression:"#yr, title, info.genres, info.actors[0]",
    KeyConditionExpression: "#yr = :yyyy and title between :letter1 and :letter2",
    ExpressionAttributeNames:{
      "#yr": "year"
    },
    ExpressionAttributeValues: {
      ":yyyy": 1992,
      ":letter1": "A",
      ":letter2": "L"
    }
  }).promise();
}

