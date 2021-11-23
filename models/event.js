const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
    from:{
        type:Date,required:true
    },
    to:{
        type:Date,required:true
    },
    content:{
        type:String,required:true
    },
    isCompleted:{
        type:Boolean,required:true
    },
    creator:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
});
module.exports = mongoose.model("Event", eventSchema)