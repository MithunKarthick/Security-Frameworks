const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", verifyToken); // adding middleware to verify token - here all path

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

app.get("/api/protected1", (req, res) => { //will be called after verification middleware
    res.send(`
    <div>
    <h1>Content in protected Route 1 for user ${req.userData}</h1>
    <a href="/api/protected2" ><p>Nav to protected site 2</p></a> 
    <a href="/logout" >Logout</a> 
    </div>
    `)
})

app.get("/api/protected2", (req, res) => { //will be called after verification middleware
    res.send(`
    <div>
    <h1>Content in protected Route 2 for user ${req.userData}</h1>
    <a href="/api/protected1" ><p>Nav to protected site 1</p></a> 
    <a href="/logout" >Logout</a>
    </div>
    `)
})

app.post("/login", (req, res) => {
    // const userData = { user: "myth", pass: "pass@123" } //mock data to test using postman
    
    //after db validation for user/pass is success the below should be executed
    const userData = req.body.user; //user name is taken as main data here (normally this should have all required details to use webapp)
    const token = jwt.sign(userData, "secret"); //siging the token
    res.cookie("myth", token, { path: "/", httpOnly: true, signed: false}); //setting the token in cookie (client can use either cookie or header)
    res.redirect("api/protected1"); // to protected route
})

app.get("/logout", (req,res) => { //when user wants to logout
    res.clearCookie("myth");
    res.redirect("/");
})

app.get("/expired", (req,res) => { //when middleware verification fails
    res.send(`
    <div>
    <h1>Session expired</h1>
    <a href="/" >Click here to Login</a>
    </div>
    `)
})

app.listen(3000, () => {    
    console.log("Listening on port 3000");
});

//middleware to verify token
function verifyToken(req, res, next) {
    console.log(req.url);
    
    if (req.headers.cookie !== undefined) {
        const cookie = req.headers.cookie.replace("myth=",""); //removing name to get exact token
        req.userData = jwt.verify(cookie, "secret");     //adding decrypted data to req object which will be used further
        if (req.url === "/" || req.url === "/login") {
            res.redirect("/api/protected1") //no need for login page once alredy cookie token genrated
        } else {
            next()
        }
    } else {    // redirect to error kind page except home page
        if (req.url === "/" || req.url === "/login") {
            next();
        } else {
            res.redirect("/expired");
        }
    }
};


