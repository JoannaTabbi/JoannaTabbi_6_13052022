const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require('jsonwebtoken');

/**
 * Register a new user. 
 * the password is securised with hash (bcrypt module)
 */
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user
        .save()
        .then((user) => res.status(201).json( 
          user
         ))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

/**
 * logs the user who's already registered. 
 * This method controls if the email given in the request is present in the Users collection, 
 * then checks if the password given matches the one assigned to the user in bd.
 * If correct, returns userId and a token.
 */
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Incorrect password" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                process.env.TOKEN_SECRET,
                { expiresIn: '24h'}
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

/**
 * displays user's data.
 * If the user's id does not match the one assigned to the user in Users Colection, 
 * the request is not authorized.
*/
exports.readUser = (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          error: new Error("User not found!")
        });
      } else if (id !== req.auth.userId) {
        res.status(403).json({
          error: new Error("Unauthorized request!")
        });
      } else {
        res.status(200).json(user);
      } 
    })
    .catch((error) => res.status(404).json({ error }));
}

/**
 * exports Data
 */
exports.exportData = (req, res, next) => {
  
}

/**
 * Updates the user data for an id given.
 * If userId from the request does not match the one stored in database, the request
 * is not authorized.
 */
exports.updateUser = (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          error: new Error("User not found!")
        });
      } else if (id !== req.auth.userId) {
        res.status(403).json({
          error: new Error("Unauthorized request!")
        });
      } else {
        User.updateOne(
          { _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "User updated !" }))
          .catch((error) => {
            res.status(400).json({
              error: error
            });
          });
      } 
    })
    .catch((error) => res.status(404).json({ error }));
}

/**
 * deletes the user data for an id given.
 * If userId from the request does not match the one stored in database, the request
 * is not authorized.
 */
exports.deleteUser = (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          error: new Error("User not found!")
        });
      } else if (id !== req.auth.userId) {
        res.status(403).json({
          error: new Error("Unauthorized request!")
        });
      } else {
       User.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(204).json({
            message: "User deleted!"
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: error
          });
        });
      } 
    })
    .catch((error) => res.status(404).json({ error }));
 }

/**
 * report User
 */
exports.reportUser = (req, res, next) => {
  
}