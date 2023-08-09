import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcrypt";


const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* mongoose server created with confirmation  */
mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const db = mongoose.connection;

db.once('open', () => {
  console.log('MongoDB server connected successfully');
});

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

/* creating a schema under mongoDB */
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
/*creating a model  */

const User = mongoose.model('User', userSchema);

/* server page */
app.get("/", (req,res)=>{
    res.render("login.ejs");
});
app.get("/sign-up", (req,res)=>{
    res.render("signup.ejs");
});

app.post("/", async(req,res)=>{
    try {
        const username = req.body.usernameLogin
        const password = req.body.passwordLogin
        const user = await User.findOne({username});
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!user || !passwordValid) {
            return("invalid user name or  password");

        }else{
            res.render("/home.ejs");
        }


        
    } catch (error) {
        console.log(error);
        
    }

});

app.post("/sign-up", async(req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            userName: req.body.username,
            password: hashedPassword
        });   
        await newUser.save();
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.redirect("/sign-up");
        
    }

});




app.listen(port,()=>{
    console.log(`server is running at ${port}`);
});
