var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Lawyer",
  tableName: "lawyers",
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
    city: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    fio: { type: "varchar", length: 255, nullable: true },
    sertificate: { type: "varchar", length: 255, nullable: true },
    phone_number: { type: "varchar", length: 45, nullable: true },
    branch: { type: "varchar", length: 255, nullable: true },
    verification_status: {
      type: "enum",
      enum: ["cancelled", "verified", "issued", "created"],
      nullable: false,
      default: "created",
    },
  },
});
