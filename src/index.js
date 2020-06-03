import {main} from "./kameleon-web";
import "./services/races.js";
import "./services/classes.js";

export const handler = main;
export {connect} from "./data-access/dynamodb";
export {service} from "./kameleon-web";
