const mongoose=require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const chatSchema=new Schema({
    roomName:{
        type:String,
        required:true
    },
    users:{
        type:Array,
        required:true
    },
    createByUser:{
        type:String,
        required:true
    }
  
});
const Room =mongoose.model('Rooms',chatSchema);

module.exports=Room;