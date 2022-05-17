const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const db = require('./app/config/db.config');
var corsOptions = {
  origin: "http://localhost:8081"
};
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to piiquante application." });
});
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


/*tests models vs bd
const Sauce = require("./models/sauce");

app.get('/api/sauces/:id', (req, res, next) => {
  const sauce = new Sauce({
  userId: "6283b33abcb05184fd1cc34c",  
  name: "Paul's sauce",
  manufacturer: "Vegga",
  description: "delicious",
  mainPepper: "mint",
  heat: 2,
  });
  sauce.save()
  .then(result => res.send(result))
  .catch(error => console.log(error))
})

const User = require("./models/user");

app.use('/api/auth/signup', (req, res, next) => {
  const user = new User({
  email: "barrylindon@wdc.com",
  password: "bl000"
  });
  user.save()
  .then(result => res.send(result))
  .catch(error => console.log(error))
})
*/