const  EntitySchema = require("typeorm").EntitySchema;
module.exports = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "bigint",
        },
        last_use: {
            type: "date",
            nullable: true
        },
        is_captcha_needed: {
            type: "boolean",
            nullable: false,
            default: true,
        },
        is_subscribed: {
            type: "boolean",
            nullable: false,
            default: false,
        },
        is_subscribed_private: {
            type: "boolean",
            nullable: false,
            default: false,
        },
        is_subscribed_add: {
            type: "boolean",
            nullable: false,
            default: false,
        },
        referer_id: {
            type: "bigint",
            nullable: true,

        }

    },
    relations: {
        referer: {
            target: "User",
            type: "one-to-one",
            cascade: true,
            joinColumn: true,
            onDelete: 'set null',
            onUpdate: 'set null',
        },
    }
});
