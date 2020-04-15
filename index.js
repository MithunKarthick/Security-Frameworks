const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use("/api", verifyToken); // adding middleware to verify token

app.get("/", (req, res) => {
    res.json({ message: "home page" });
});

app.post("/api", (req, res) => {
    res.json({ message: "Protected route" })
})

app.post("/login", (req, res) => {
    // const userData = req.body;
    const userData = { user: "myth", email: "myth@dg.com" } //mock data
    const token = jwt.sign(userData, "secret"); //siging data
    res.json({ token });    //can be sent via cookie
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

function verifyToken(req, res, next) {
    const bearer = req.headers.authorization; //should be get via header authorization method bearer - postman
    if (bearer !== undefined) {
        const token = bearer.replace("Bearer ", "");
        req.userData = jwt.verify(token, "secret");     //adding decrypted data to req object
        next();
    } else {
        res.status(401).send("Unauthorized Entry");
    }
};



