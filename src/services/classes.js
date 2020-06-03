import {ClassesDAL} from "../data-access";
import {HttpError, service} from "../kameleon-web";

service["GET /{apiVersion}/classes"] = getClasses;
async function getClasses(event) {
  const {limit, brief} = event.queryStringParameters;
  const {accountId} = event;

  console.log(event);

  const fields = {};
  if (brief) {
    Object.assign(fields, {
      accountId: true,
      uniqueId: true,
      name: true,
      description: true
    });
  }
  return ClassesDAL.scan(accountId, {limit, fields});
}

service["POST /{apiVersion}/classes"] = createClass;
async function createClass(event) {
  const {body, accountId} = event;

  body.uniqueId = `${accountId}:${body.source.toLowerCase().replace(/ /g, "-")}:${body.name.toLowerCase().replace(/ /g, "-")}`;

  const res = await ClassesDAL.create(accountId, body);

  if (!res) {
    throw HttpError(409, `Rejected. Class with uniqueId=${body.uniqueId} already exists`);
  }

  return body.uniqueId;
}

service["GET /{apiVersion}/classes/{classId}"] = getClass;
async function getClass() {
  // const cls = classes.find(c => c.uniqueId === event.pathParameters.classId);
  // if (!cls) {
  //   throw HttpError(404, `Class with uniqueId="${event.pathParameters.classId}" not found`);
  // }
  // return cls;
  throw HttpError(500, "getClass is not implemented yet");
}

service["DELETE /{apiVersion}/classes/{classId}"] = deleteClass;
async function deleteClass() {
  // const cls = classes.find(c => c.uniqueId === event.pathParameters.classId);
  // if (!cls) {
  //   throw HttpError(404, `Class with uniqueId="${event.pathParameters.classId}" not found`);
  // }
  // throw HttpError(500, "deleteClass is not implemented yet");
  throw HttpError(500, "deleteClass is not implemented yet");
}

service["PUT /{apiVersion}/classes/{classId}"] = updateClass;
async function updateClass() {
  // const cls = classes.find(c => c.uniqueId === event.pathParameters.classId);
  // if (!cls) {
  //   throw HttpError(404, `Class with uniqueId="${event.pathParameters.classId}" not found`);
  // }
  throw HttpError(500, "updateClass is not implemented yet");
}

