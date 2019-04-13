
const express=require('express');
const expressLayouts=require('express-ejs-layouts');
const mongoose=require('mongoose');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
var bodyParser = require('body-parser');
var path = require('path');
const Chat=require('./models/Chats');
const Users=require('./models/Users');
const Room=require('./models/Rooms');
const app=express();

const PORT=process.env.PORT || 5000;

//Passport config
require('./config/passport')(passport);
var server = require('http').Server(app);
var client = require('socket.io')(server);

//Connect DB
const db=require('./config/keys').MongoURI;

//mongoose.connect(db,{useNewUrlParser:true})
//.then(()=>console.log('MongoDB Connected'))
//.catch(err=>console.log(err));
server.listen(5000);

mongoose.connect(db,{useNewUrlParser:true},function(err,database){

    users=[];
    roomName="";
    connections=[];
    if(err)
    {
        throw err;
    }
    console.log('Connect');

   /* 
   Users collection count
   database.collection("users").count({},function(err,usercount){
        if(err)
        {
            throw err;
        }
        else
        {
            
        }
    });
    */

  // Connect to Socket.io
  client.on('connection', function(socket){
     connections.push(users.length);
     console.log(`Connection ${connections.length} sockets connected`);
     socket.on('disconnect',function(data){
         if(!socket.username) return ;
     //Disconnect
     users.splice(users.indexOf(socket.username),1);
     connections.splice(connections.indexOf(socket),1);
     updateUsers();
     console.log(`Disconnected: ${connections.length} sockets connected`);
     });

     socket.on('addUser',function(data,callback){
        callback(true);
        socket.username=data;
        kontrol=true;
        if(users.length>0)
        {
            for(var x=0;x<users.length;x++)
            {
                if(users[x]==socket.username || users[x]==null)
                {
                    kontrol=false;
                    updateUsers();
                    break;
                }
                else
                {
                    kontrol=true;
                }
            }
            if(kontrol)
            {
            users.push(socket.username);
            updateUsers();
            }
        }else
        {
            users.push(socket.username);
            updateUsers();
        }
      
        
     });
     socket.on("channelfixer",function(data){
         socket.join(data);
     });
     socket.on("chatmessage",function(msg){
         roomName=msg;
         console.log(msg);
         client.to(socket.rooms[msg]).emit('message',`${socket.username} join room`);
         Room.find({_id:msg},(err,res)=>{
            if(!err)
             {
                 console.log('roomuser',res);
                 client.to(socket.rooms[msg]).emit('getRoomUsers',res[0].users);
                }
             else
             {
                 throw err;
             }
        })
     });
     socket.on("sendMessageInfo",function(data){       
       Chat.find({roomId:data.roomId},(err,res)=>{
           if(!err)
           {
               socket.emit("getMessageHistory",res);
           }
           else
           {
               throw err;
           }
       });
     
     });
     
     socket.on('input',function(data){
         var chat=new Chat({
             roomId:data.roomId,
             name:data.name,
             message:data.message
         });
         chat.save((err,res)=>{
             if(!err){
                 client.to(socket.rooms[data.roomId]).emit('getMessageHistory',[data]);
             }
             else
             {
                 throw err;
             }
         })
     })
     /*
     socket.on('sendMessageAllUsers',function(data){
         debugger
        database.collection("users").find({}).toArray(function(err,res){
            
            var isActive=false;
            for(let i=0;i<res.length;i++)
            {
                //Socket aynı anda birden çok kullanıcıya veri gönderir.
                if(res[i].name!=socket.username)
                {
                    for(let x=0;x<users.length;x++)
                    {
                      if(res[i].name==users[x])
                      {
                          isActive=true;
                          break;
                      }
                      else
                      {
                          isActive=false;
                      }
                        
                    }
                    var myobj = { gonderen: socket.username, alan:res[i].name,message:data,isActive:isActive  };
                    database.collection("chats").insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                    });
                }
              
            }
        })
    });
    */
    /*
    socket.on('sendUsersInfo',function(data){
        console.log(data);
        console.log(data.loginUser);

        Chat.find({gonderen:data.loginUser,alan:data.sendUser},(err,res)=>{
            client.emit('getChatPast',res);
        })
    }) */
     function updateUsers()
     {
        client.emit('getUsers',users);
     }
 


    });

  
});



//Express Session
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

//Password middleware
app.use(passport.initialize());
app.use(passport.session());


//Connect Flash
app.use(flash());
//Global Vars

app.use((req,res,next)=>{
    res.locals.success_message=req.flash('success_message');
    res.locals.error_message=req.flash('error_message');
    next();

})


//EJS
app.use(expressLayouts);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Routes
app.use('/',require('./routes/index.js'));
app.use('/users',require('./routes/users.js'));




