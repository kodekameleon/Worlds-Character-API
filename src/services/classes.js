import {HttpError, service} from "../kameleon-web";

const classes = [
  {
    uniqueId: "srd:barbarian",
    name: "Barbarian"
  },
  {
    uniqueId: "srd:bard",
    name: "Bard"
  },
  {
    uniqueId: "srd:cleric",
    name: "Cleric"
  },
  {
    uniqueId: "srd:druid",
    name: "Druid"
  },
  {
    uniqueId: "srd:fighter",
    name: "Fighter"
  },
  {
    uniqueId: "srd:monk",
    name: "Monk"
  },
  {
    uniqueId: "srd:paladin",
    name: "Paladin"
  },
  {
    uniqueId: "srd:ranger",
    name: "Ranger"
  },
  {
    uniqueId: "srd:rogue",
    name: "Rogue"
  },
  {
    uniqueId: "srd:sorcerer",
    name: "Sorcerer"
  },
  {
    uniqueId: "srd:warlock",
    name: "Warlock"
  },
  {
    uniqueId: "srd:wizard",
    name: "Wizard"
  }
];

service["GET /{apiVersion}/classes"] = getClasses;
async function getClasses(event) {
  const offset = event.queryStringParameters?.offset || 0;
  const limit = event.queryStringParameters?.limit || 200;
  return classes.slice(offset, limit);
}

service["POST /{apiVersion}/classes"] = createClass;
async function createClass(event) {
  console.log(event);
  throw HttpError(500, "createClass is not implemented yet");
}

service["GET /{apiVersion}/classes/{classId}"] = getClass;
async function getClass(event) {
  const cls = classes.find(c => c.uniqueId === event.pathParameters.classId);
  if (!cls) {
    throw HttpError(404, `Class with uniqueId="${event.pathParameters.classId}" not found`);
  }
  return cls;
}

service["DELETE /{apiVersion}/classes/{classId}"] = deleteClass;
async function deleteClass(event) {
  const cls = classes.find(c => c.uniqueId === event.pathParameters.classId);
  if (!cls) {
    throw HttpError(404, `Class with uniqueId="${event.pathParameters.classId}" not found`);
  }
  throw HttpError(500, "deleteClass is not implemented yet");
}

service["PUT /{apiVersion}/classes/{classId}"] = updateClass;
async function updateClass(event) {
  const cls = classes.find(c => c.uniqueId === event.pathParameters.classId);
  if (!cls) {
    throw HttpError(404, `Class with uniqueId="${event.pathParameters.classId}" not found`);
  }
  throw HttpError(500, "updateClass is not implemented yet");
}

