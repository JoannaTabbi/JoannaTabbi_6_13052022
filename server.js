const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const router = require('./app/routes/index');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const speedLimiter = require('./app/middleware/speed-limiter')

// setting headers for CORS errors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

const db = require('./app/config/db.config');
var corsOptions = {
  origin: "http://localhost:4200"
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));
app.use('/api', router);
// set path to images
app.use("/images", express.static(path.join(__dirname, "images")));

/**
 * searche for the keys beginning with $ or containing . characters and removes 
 * these caracters from user-supplied input in the following places:
 - req.body
 - req.params
 - req.headers
 - req.query
 */
app.use(mongoSanitize());

//apply speed limiter to all requests
app.use(speedLimiter);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;