const TABLE_NAME = "worlds-races";

module.exports = {
  migrate: async ({helpers}) => {
    // Read the schema version for the table
    const tableVersion = await helpers.getTableVersion(TABLE_NAME);

    // If the table does not exist create it
    if (tableVersion.version === undefined) {
      await helpers.createStandardTable(TABLE_NAME);
      await helpers.setTableVersion(TABLE_NAME, 1);
    }
  }
};
