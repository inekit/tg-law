var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "bigint",
    },
    username: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    last_use: {
      type: "date",
      nullable: true,
    },
    wallet_addr: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    wl_count: {
      type: "int",
      nullable: false,
      default: 0,
    },
    lootbox_count: {
      type: "int",
      nullable: false,
      default: 1,
    },
    nft_count: {
      type: "int",
      nullable: false,
      default: 0,
    },
  },
});
