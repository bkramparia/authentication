//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

app.use(session({
  secret: "thisispassportmongoose",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    console.log("redirect to login not authenticate");
    res.redirect("/login");
  }
});

app.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});

//--------
// passport.use(new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password'
// }, User.authenticate()));

app.post("/register", function(req, res) {
  User.register({
    username:req.body.username
  }, req.body.password, function (err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      console.log(user);
      passport.authenticate("local")(req, res, function() {
        console.log("authenticate successful");
        res.redirect("/secrets");
      });
    }
  })
});

app.post("/login", function(req, res) {
  const user = new User ({
    email: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      User.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  })
});



app.listen(3000, function(err) {
  if (!err) {
    console.log("server running on port 3000");
  } else {
    console.log(err);
  }
});
