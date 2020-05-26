
import {service} from "../kameleon-web";

service["GET /{apiVersion}/classes/{classId}"] = getClass;
async function getClass(event) {
  console.log(event);
  return {
    items: [
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
    ]
  };
}

