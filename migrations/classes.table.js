const characterService = require("../dist/service");
const data = require("./classes.data");

const TABLE_NAME = "worlds-classes";

module.exports = {
  migrate: async ({helpers}) => {
    // Read the schema version for the table
    const tableVersion = await helpers.getTableVersion(TABLE_NAME);

    // If the table does not exist create it and populate it
    if (!tableVersion.version) {
      console.log("Create classes table");
      await helpers.createStandardTable(TABLE_NAME);
      await helpers.setTableVersion(TABLE_NAME, 1);

      // Now populate the table
      console.log("Populate classes table");
      const createClass = Object.values(characterService.service).find(f => f.name === "createClass");
      for (const c of data.classes) {
        await createClass({accountId: "worlds", body: c});
      }
    }
  }
};
