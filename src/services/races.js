// import {dynamodb} from "../connect";
import {service} from "../kameleon-web";

service["GET /{apiVersion}/races/{raceId}"] = getRace;
async function getRace(event) {
  console.log(event);
  return {
    items: [
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
    ]
  };

  // return dynamodb.query({
  //   TableName : "Movies",
  //   ProjectionExpression:"#yr, title, info.genres, info.actors[0]",
  //   KeyConditionExpression: "#yr = :yyyy and title between :letter1 and :letter2",
  //   ExpressionAttributeNames:{
  //     "#yr": "year"
  //   },
  //   ExpressionAttributeValues: {
  //     ":yyyy": 1992,
  //     ":letter1": "A",
  //     ":letter2": "L"
  //   }
  // }).promise();
}

