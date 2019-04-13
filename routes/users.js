
const express=require('express');
const bcrypt=require('bcryptjs');
const router=express.Router();
const passport=require('passport');

//User Model
const User=require('../models/Users');
const Chat=require('../models/Chats');
router.get('/login',function(req,res){
    res.render('login');
});
router.get('/register',function(req,res){
    res.render('register');
});
router.post('/register',function(req,res){
    const {name,email,password,password2}=req.body;
    let errors=[];

    //Check required fields
    if(!name || !email || !password || !password2)
    {
        errors.push({msg:'Please fill in all fields '});
    }
    //Check password
    if(password!=password2)
    {
        console.log('password error');
        errors.push({msg:'Passwords do not match'});
    }
    if(errors.length>0)
    {
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else
    {
        const newUser=new User({
            name,
            email,
            password
        });
        //Hash password
        bcrypt.genSalt(10,(err,salt)=>
        bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err) throw err;

            newUser.password=hash;
            newUser.save().then(user=>{
                res.redirect('/users/login');
            }).catch(err=>console.log(err));


        })
        );
    }
});

router.post('/login',function(req,res,next){

    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash:false
    })(req,res,next);
});
router.get('/logout',function(req,res){
    req.logOut();
    res.redirect('/users/login');
})
module.exports=router;