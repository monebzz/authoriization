const express = require('express');
const app = express();
const User= require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session')



mongoose.connect('mongodb://localhost:27017/Hello')
    .then(() => {
        console.log('Mongo Connection Open!');
    })
    .catch(err => {
        console.log('Mongo Connection Error!');
        console.log(err);
    });

app.set('view engine','ejs');
app.set('views','views');

app.use(session({ secret: 'notagoodsecret'}))

app.use(express.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    res.send("this is the home page")
});

app.get('/register',(req,res)=>{
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { password, username } = req.body;

    if (!password) {
        return res.status(400).send('Password is required!');
    }

    try {
        const hash = await bcrypt.hash(password, 12);
        
        const user = new User({
            username,
            password: hash // Use the hash here
        });

        await user.save();
        req.session.user_id=user._id;
        res.redirect('/');
    } catch (err) {
        console.error('Error hashing password or saving user:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login',async (req,res)=>{
    const {username,password}=req.body;
    const user= await User.findOne({username});
    const ValidPassword=await bcrypt.compare (password,user.password);
    if(ValidPassword){
        req.session.user_id=user._id;
        res.redirect('/secret')
    }
    else{
        res.redirect('/login')
    }
    })

app.post('/logout',(req,res)=>{
    //req.session.user_id=null;
    req.session.destroy();
    res.redirect('/login');
})
app.get('/secret',(req,res)=>{
    if(!req.session.user_id){
        res.redirect('/login')
    }
res.render('secret');
})

app.listen(3000,()=>{
    console.log('serving ur app')
})