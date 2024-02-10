//jshint esversion: 6

/*-----------------------------------------------------------------------------------------------------------------------*/

//IMPORT EXPRESS MODULE
const express = require("express");
const app = express();
app.use(express.static("public"));

//IMPORT SESSION MODULE
const session = require("express-session");

//IMPORT EJS MODULE
const ejs = require("ejs");
app.set("view engine", "ejs");

//IMPORT BODY-PARSER MODULE
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//IMPORT LODASH MODULE
var _ = require("lodash");

//IMPORT PASSPORT MODULE
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//IMPORT MONGOOSE MODULE
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://emretamturk:123qwe456asd..@cluster0.lcdxhou.mongodb.net/leaderboard",
  { useNewUrlParser: true }
);

/*-----------------------------------------------------------------------------------------------------------------------*/

//CREATE SCHEMA + MODEL FOR POST
const postSchema = new mongoose.Schema({
  author: { type: String, required: "Can not be empty" },
  title: { type: String, required: "Can not be empty" },
  content: { type: String, required: "Can not be empty" },
  date: { type: Date, default: Date.now() },
});
const Post = mongoose.model("Post", postSchema);

//CREATE SCHEMA + MODEL FOR TEAM MEMBERS-AUTHOR OPTION LIST
const teamSchema = new mongoose.Schema({ member: String });
const Team = mongoose.model("Team", teamSchema);

//CREATE SCHEMA + MODEL FOR LOGIN
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*-----------------------------------------------------------------------------------------------------------------------*/

/*
//REGISTER PAGE ROUTE GET METHOD
app.get("/register", function (req, res) {
  res.render("register");
});
*/

//ABSTRACT PAGE ROUTE GET METHOD
app.get("/abstract", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("abstract");
  } else {
    res.redirect("/login");
  }
});

//LOGIN PAGE ROUTE GET METHOD
app.get("/login", function (req, res) {
  res.render("login");
});

//ABSTRACT ROUTE GET METHOD
app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("abstract");
  } else {
    res.redirect("/login");
  }
});

//LIBRARY ROUTE GET REDIRECTION
app.get("/library", function (req, res) {
  if (req.isAuthenticated()) {
    Post.find({}).then((posts) => {
      res.render("library", { posts: posts });
    });
  } else {
    res.redirect("/login");
  }
});

//LEADERBOARD ROUTE GET REDIRECTION
app.get("/leaderboard", function (req, res) {
  if (req.isAuthenticated()) {
    Post.find({}).then((posts) => {
      res.render("leaderboard", { posts: posts });
    });
  } else {
    res.redirect("/login");
  }
});

//SHARE ROUTE GET REDIRECTION
app.get("/share", function (req, res) {
  if (req.isAuthenticated()) {
    Team.find({}).then((teams) => {
      res.render("share", { teams: teams });
    });
  } else {
    res.redirect("/login");
  }
});

//POSTS PAGE GET METHOD
app.get("/post/:postId", function (req, res) {
  if (req.isAuthenticated()) {
    const requestedPostId = req.params.postId;

    Post.findOne({ _id: requestedPostId }).then(function (post) {
      res.render("post", {
        _id: post._id,
        author: post.author,
        title: post.title,
        content: post.content,
        date: post.date,
      });
    });
  } else {
    res.redirect("/login");
  }
});

/*-----------------------------------------------------------------------------------------------------------------------*/

/* 
//REGISTER ROUTE POST METHOD********************************
app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/login");
        });
      }
    }
  );
});
*/

//LOGIN ROUTE POST METHOD
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      res.send("Your username and password are incorrect");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.render("abstract");
      });
    }
  });
});

//NEWPOST ROUTE POST METHOD
app.post("/share", function (req, res) {
  const author = req.body.Author;
  const title = req.body.PostTitle;
  const content = req.body.PostContent;

  const newPost = new Post({
    author: author,
    title: _.upperCase(title),
    content: content,
  });
  newPost.save();
  res.redirect("/library");
});

/*-----------------------------------------------------------------------------------------------------------------------*/

/*
//POST ROUTE DELETE METHOD
app.delete("/post/:postId", function (req, res) {
  if (req.isAuthenticated()) {
    const requestedPostId = req.params.postId;
    Post.findByIdAndRemove({ _id: requestedPostId }).then(function (post) {
      res.render("post", {
        _id: post._id,
        author: post.author,
        title: post.title,
        content: post.content,
        date: post.date,
      });
      res.redirect("/library");
    });
  } else {
    res.redirect("/login");
  }
});
*/

/*-----------------------------------------------------------------------------------------------------------------------*/

//SERVER LISTEN PORT

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server started on port 3000");
});
