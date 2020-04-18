// Experimenting with Sessions //

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mongoose.createConnection("mongodb://localhost:27017/session", 
        {useNewUrlParser: true,
        useUnifiedTopology: true});  // mongoDB connection (asynchronous but have time to connect for now)

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

app.get("/", (req, res) => {  //home page to send user name and password to logon route
    res.send(`
    <div>
    <h1>Login!</h1>
    <form action="/login" method="post">
    <input name="user" type="text" placeholder="Name" />
    <input name="pass" type="password" placeholder="password" />
    <button type="submit">Submit</button>
    </div>
    `);
});


app.post("/login", (req,res)=>{
    // const userData = { user: "myth", pass: "pass@123" } //mock data to test using postman
    
    req.session.user = req.body.user;
    req.session.count = 1;  
    res.redirect("/api/protected1");
});

app.get("/logout", (req,res)=>{
    req.session.destroy();
    res.redirect("/");
});

app.get("/api/protected1", (req, res) => {      //will be called after verification middleware
    res.send(`
    <div>
    <h1>Content in protected Route 1 for user ${req.session.user}, viewed ${req.session.count} times</h1>
    <a href="/api/protected2" ><p>Nav to protected site 2</p></a> 
    <a href="/logout" >Logout</a> 
    </div>
    `)
});

app.get("/api/protected2", (req, res) => {      //will be called after verification middleware
    res.send(`
    <div>
    <h1>Content in protected Route 2 for user ${req.session.user}, viewed ${req.session.count} times</h1>
    <a href="/api/protected1" ><p>Nav to protected site 1</p></a> 
    <a href="/logout" >Logout</a> 
    </div>
    `)
});

app.get("/expired", (req,res) => {  //when middleware verification fails
    res.send(`
    <div>
    <h1>Session expired</h1>
    <a href="/" >Click here to Login again</a>
    </div>
    `)
})

app.listen(3000, () => {
    console.log("Server listening on port 3000");    
});

function verifySession(req,res,next){
    if(req.session.user !== undefined){
        req.session.count++;
        next();
    }else{
        res.redirect("/expired");
    }
}
