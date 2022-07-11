//var EntitySchema = require("typeorm").EntitySchema;
import { EntitySchema } from "typeorm";

export default  new EntitySchema({
    name: "Statistics", 
    tableName: "statistics", 
    columns: {
        date:{
            primary: true,
            type:"date"
        },
        users_per_day: {
            type: "int",
            default:0,
        },
        cart_per_day: {
            type: "int",
            default:0,        
        },
        
    }
});