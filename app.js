import express from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
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
/* 1 user id schema*/
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

/*2 question schema */
const questionSchema = new mongoose.Schema({
  title: String,
  content: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }]
});
/*3 Answer schema*/
const answerSchema = new mongoose.Schema({
  content: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
  
})
/*creating a model  */

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);
const Answer = mongoose.model('Answer', answerSchema);

/* server page */
app.get("/", (req,res)=>{
    res.render("login.ejs");
});
app.get("/sign-up", (req,res)=>{
    res.render("signup.ejs");
});
app.get("/question", (req,res)=>{
  res.render("question.ejs");
});
app.get("/dashboard",async (req,res)=>{
  try {
    const questions = await Question.find(); 
    res.render('home.ejs', { questions }); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
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
    
        res.redirect("/dashboard");
      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during login');
      }

});

app.post('/question', async (req, res) => {
  const { title, content } = req.body;
  const userId = req.userId;
  try {
    const newQuestion = new Question({
      title,
      content,
      userId: userId,
    });
    await newQuestion.save();  
    res.redirect("/dashboard");
    

    

  } catch (error) {
    res.status(500).json({ error: 'Failed to add question' });
    console.log(error);
  }
});

app.post('/:questionId/answer', async (req, res) => {
  const { content } = req.body;
  const { questionId } = req.params;
  try {
    const answer = await Answer.create({
      content,
      userId: req.userId,
      questionId,
    });

    await Question.findByIdAndUpdate(questionId, {
      $push: { answers: answer._id },
    });

    res.status(201).json({ message: 'Answer added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add answer' });
  }
});




app.listen(port,()=>{
    console.log(`server is running at ${port}`);
});
