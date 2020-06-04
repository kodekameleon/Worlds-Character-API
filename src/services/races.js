// import {dynamodb} from "../connect";
import {HttpError, service} from "../kameleon-web";

const races = [
  {
    uniqueId: "srd:dwarf",
    name: "Dwarf"
  },
  {
    uniqueId: "srd:elf",
    name: "Elf"
  },
  {
    uniqueId: "srd:halfling",
    name: "Halfling"
  },
  {
    uniqueId: "srd:human",
    name: "Human"
  },
  {
    uniqueId: "srd:dragonborn",
    name: "Dragonborn"
  },
  {
    uniqueId: "srd:gnome",
    name: "Gnome"
  },
  {
    uniqueId: "srd:halfelf",
    name: "Half-Elf"
  },
  {
    uniqueId: "srd:halforc",
    name: "Half-Orc"
  },
  {
    uniqueId: "srd:tiefling",
    name: "Tiefling"
  },
];

// service["GET /{apiVersion}/races/{raceId}"] = getRace;
// async function getRace(event) {
//   return dynamodb.query({
//     TableName : "Movies",
//     ProjectionExpression:"#yr, title, info.genres, info.actors[0]",
//     KeyConditionExpression: "#yr = :yyyy and title between :letter1 and :letter2",
//     ExpressionAttributeNames:{
//       "#yr": "year"
//     },
//     ExpressionAttributeValues: {
//       ":yyyy": 1992,
//       ":letter1": "A",
//       ":letter2": "L"
//     }
//   }).promise();
// }


service["GET /{apiVersion}/races"] = getRaces;
async function getRaces(event) {
  const offset = event.queryStringParameters?.offset || 0;
  const limit = event.queryStringParameters?.limit || 200;
  return races.slice(offset, limit);
}

service["POST /{apiVersion}/races"] = createRace;
async function createRace(event) {
  console.log(event);
  throw HttpError(500, "createRace is not implemented yet");
}

service["GET /{apiVersion}/races/{raceId}"] = getRace;
async function getRace(event) {
  const cls = races.find(c => c.uniqueId === event.pathParameters.classId);
  if (!cls) {
    throw HttpError(404, `Race with uniqueId="${event.pathParameters.classId}" not found`);
  }
  return cls;
}

service["DELETE /{apiVersion}/races/{raceId}"] = deleteRace;
async function deleteRace(event) {
  const cls = races.find(c => c.uniqueId === event.pathParameters.classId);
  if (!cls) {
    throw HttpError(404, `Race with uniqueId="${event.pathParameters.classId}" not found`);
  }
  throw HttpError(500, "deleteRace is not implemented yet");
}

service["PUT /{apiVersion}/races/{raceId}"] = updateRace;
async function updateRace(event) {
  const cls = races.find(c => c.uniqueId === event.pathParameters.classId);
  if (!cls) {
    throw HttpError(404, `Race with uniqueId="${event.pathParameters.classId}" not found`);
  }
  throw HttpError(500, "updateRace is not implemented yet");
}


