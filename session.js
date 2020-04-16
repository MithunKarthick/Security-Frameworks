// Experimenting with Sessions //

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session)

const app = express();

const connection = mongoose.createConnection("mongodb://localhost:27017/session", 
        {useNewUrlParser: true,
        useUnifiedTopology: true});  // mongoDB connection (asynchronous but have time to connect)

app.use(bodyParser.json());

app.use(session({
    secret: "secret",
    store: new MongoStore({
        mongooseConnection: connection,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: "/",
        maxAge: 600000,
        httpOnly: true
    },
    name: "myth", //cookie name 
    genid: (req) => { return req.body.user } //should be the unique key for db
}));

app.use("/api",verifySession);

app.get("/", (req,res)=> {
    console.log(req.session);
    res.send("Home Page");
});

app.get("/api", (req,res) => {
    console.log(req.session);
        res.send(`viewed ${req.session.count} times`);
})

app.post("/login", (req,res)=>{
    // const user1 = { user: "myth1", email: "myth1@at.com" };
    // const user2 = { user: "myth2", email: "myth2@at.com" }; //mock user to test (body of postman)
    req.session.email = req.body.email;
    req.session.count = 0;
    res.send("Session registered");
});

app.post("/logout", (req,res)=>{
    req.session.destroy();
    console.log(req.session);
    res.send("session closed");
})

app.listen(3000, () => {
    console.log("Server listening on port 3000");    
});

function verifySession(req,res,next){
    if(req.session.email !== undefined){
        req.session.count++;
        next();
    }else{
        res.status(200).send("session expired");
    }
}
