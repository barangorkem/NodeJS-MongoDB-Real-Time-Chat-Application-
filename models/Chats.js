const mongoose=require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const chatSchema=new Schema({
    roomId:{
        type:ObjectId,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
});
const Chat =mongoose.model('Chats',chatSchema);

module.exports=Chat;