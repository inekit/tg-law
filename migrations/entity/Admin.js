//var EntitySchema = require("typeorm").EntitySchema;
import { EntitySchema } from "typeorm";
export default new EntitySchema({
    name: "Admin", 
    tableName: "admins",
    columns: {
        user_id: {
            type: "bigint",
            primary: true,
        },
        can_update_admins: {
            type: "boolean",
            default: false,
        }
    },
    relations: {
        user: {
            target: "User",
            type: "one-to-one",
            cascade: true,
            joinColumn: true,
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
    }
});