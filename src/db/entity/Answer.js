var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Answer",
  tableName: "answers",
  columns: {
    id: {
      type: "int",
      generated: true,
    },
    lawyer_id: {
      primary: true,

      nullable: false,
      type: "bigint",
    },
    appointment_id: {
      primary: true,

      nullable: false,
      type: "int",
    },
  },
  relations: {
    lawyer: {
      target: "Lawyer",
      type: "many-to-one",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    appointment: {
      target: "Appointment",
      type: "many-to-one",
      cascade: true,
      joinColumn: true,
      onDelete: "cascade",
      onUpdate: "cascade",
    },
  },
});
