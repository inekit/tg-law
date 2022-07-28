var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Appointment",
  tableName: "appointments",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    worker_id: {
      type: "bigint",
      nullable: true,
    },
    worker_rate: {
      type: "int",
      nullable: true,
    },
    customer_id: {
      type: "bigint",
      nullable: false,
    },
    city: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    branch: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    description: {
      type: "varchar",
      length: 2000,
      nullable: false,
    },
    price: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    timeout: {
      type: "int",
      nullable: false,
    },
    is_payed: {
      type: "bool",
      default: false,
      nullable: false,
    },
    post_id: {
      type: "bigint",
      nullable: true,
    },
  },
  relations: {
    customer: {
      target: "User",
      type: "many-to-one",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    worker: {
      target: "Lawyer",
      type: "many-to-one",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  },
});
