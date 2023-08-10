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



app.post("/sign-up", async(req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });   
        await newUser.save();
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.redirect("/sign-up");
        
    }

});


app.post("/", async(req,res)=>{
    try {
        const { usernameLogin, passwordLogin } = req.body;
        const user = await User.findOne({ username:usernameLogin });
        if (!user) {
          return res.status(404).send('User not found');
        }
    
        const isPasswordValid = await bcrypt.compare(passwordLogin, user.password);
    
        if (!isPasswordValid) {
          return res.status(401).send('Invalid password');
        }
    
        res.render("home.ejs");
      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during login');
      }

});




app.listen(port,()=>{
    console.log(`server is running at ${port}`);
});
