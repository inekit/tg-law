var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "Nft", 
    tableName: "nfts", 
    columns: {
        id: {
            primary: true,
            type: "int",
            generated:true
        },
    }
});