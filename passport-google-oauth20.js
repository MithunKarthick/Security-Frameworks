require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google"
  },
  function(accessToken, refreshToken, profile, cb) {
    cb(null, profile);
  }
));

app.use("/api",passport.authenticate("google", {
     session: false, 
     scope: [ "profile" ], 
     failureRedirect: "/" }));

app.get("/", (req, res) => {            //home page to send user name and password to logon route
    res.send(`
    <div>
    <h1>Passport Google OAuth2</h1>
    <form action="/api/login" method="post">
    <button type="submit">Login via Google</button>
    </div>
    `);
});

app.post("/api/login", (req,res) => {
    console.log("authenticated");    
})

app.get("/auth/google", (req,res) => {
    console.log("test");
    res.redirect("/api/protected")
})

app.get("/api/protected", (req,res)=>{
    res.send("Protected site")
})

app.listen(3000, () => {    
    console.log("Listening on port 3000");
});



