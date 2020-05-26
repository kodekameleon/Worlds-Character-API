
import {service} from "../kameleon-web";

service["GET /{apiVersion}/classes/{classId}"] = getClass;
async function getClass(event) {
  return event;
}

