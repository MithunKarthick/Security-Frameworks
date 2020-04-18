const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mongoose.createConnection("mongodb://localhost:27017/test",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });  // mongoDB connection (asynchronous but have time to connect for now)

connection.set("useCreateIndex", true)

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    pass: String
});

userSchema.plugin(passportLocalMongoose);

const User = connection.model("user", userSchema, "users");

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {  //home page to send user name and password to logon route
    res.send(`
    <div>
    <h1>Login!</h1>
    <form action="/login" method="post">
    <input name="email" type="email" placeholder="Email" />
    <input name="pass" type="password" placeholder="password" />
    <button type="submit">Submit</button>
    </div>
    <div>Not Registered? Click <a href="/registerScreen">here</a>!</div>
    `);
});

app.get("/registerScreen", (req, res) => {  //home page to send user name and password to logon route
    res.send(`
    <div>
    <h1>Register!</h1>
    <form action="/register" method="post">
    <input name="email" type="email" placeholder="Email" />
    <input name="pass" type="password" placeholder="password" />
    <button type="submit">Submit</button>
    </div>
    `);
});

app.post("/register", async(req, res) => {

    try {
    await User.register({ username: req.body.email }, req.body.pass);
    const { user } = await User.authenticate("local")(req.body.email, req.body.pass);
    console.log(user);
    res.redirect("/protected");
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { user } = await User.authenticate("local")(req.body.email, req.body.pass );
        console.log(user);
        res.redirect("/protected");
    } catch (error) {
        console.log(error);
        res.redirect("/");
        }
})

app.get("/protected", (req, res) => {
    console.log(req);

    if (req.isAuthenticated()) {
        res.send(`
    <div>
    <h1>Protected Route</h1>
    <a href="/logout" >Logout</a> 
    </div>
    `)
    } else {
        res.redirect("/")
    }
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
