var EntitySchema = require("typeorm").EntitySchema;

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
        wallet_arrd: {
            type: "varchar",
            length: 255,
            nullable: true
        },
        nft_count: {
            type: "int",
            nullable: false,
            default: 0
        }
        
    }
});