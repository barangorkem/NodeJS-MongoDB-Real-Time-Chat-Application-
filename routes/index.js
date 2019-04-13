
const express=require('express');

const router=express.Router();
//User Model
const User=require('../models/Users');
const Room=require('../models/Rooms');
const {ensureAuthenticated} =require('../config/auth');

router.get('/',function(req,res){
    res.render('welcome',{ layout:''});
});
router.get('/dashboard',ensureAuthenticated,function(req,res){

    Room.find({ "users": req.user.name },(err,data)=>{
        if(!err)
        {
            console.log(data);
            res.render('dashboard',{
                name:req.user.name,
                userRooms:data
            });
        }
        else
        {
            throw err;
        }
    })
  
  
});
router.get('/openroom',ensureAuthenticated,function(req,res){
    console.log(req.user.email);
    User.find({'email':{'$ne':req.user.email}},{"_id":0,"name":1},(err,data)=>{
        if(!err)
        {
            console.log(data);
            res.render('openroom',{users:data,name:req.user.name});
        }
    });

});
router.post('/openroom',ensureAuthenticated,function(req,res){

    userArray=[];
    userArray=req.body.userArray;
    console.log(userArray);
    userArray.push(req.user.name);
    
    const roomData=new Room({
        roomName:req.body.roomName,
        users:userArray,
        createByUser:req.user.name
    });
    console.log(roomData);
    roomData.save((err,doc)=>{
        if(!err)
        {
            console.log("Başarılı");
            res.send(doc);
        }
        else
        {
            console.log("Hata");
            res.send(false);
        }
    })
    
  
    

});

router.get('/chatroom/:id',ensureAuthenticated,(req,res)=>{

    console.log("chatroom get");
    var isEqual=false;
    Room.findById({_id:req.params.id},(err,data)=>{
        if(!err)
        {
            for(var x=0;x<data.users.length;x++)
            {
               console.log(data.users[x]);
                if(data.users[x]==req.user.name)
                {
                isEqual=true;                    
                }
            }
        if(isEqual)
        {
            console.log(req.user);
            res.render('chatroom',{chatRoomInfo:data,name:req.user.name});
        }
        else
        {
            res.redirect('/dashboard');

        }

        }
        else
        {
            res.redirect('/dashboard');

        }
    })
});
router.get('/chat/:username',function(req,res){
 
    res.render('userchat',{sendUser:req.params.username,loginUser:req.user.name});

});
module.exports=router;