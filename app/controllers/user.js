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
        .catch((error) => res.status(400).json({
          error
        }));
    })
    .catch((error) => res.status(500).json({
      error
    }));
};

/**
 * logs the user who's already registered. 
 * This method controls if the email given in the request is present in the Users collection, 
 * then checks if the password given matches the one assigned to the user in bd.
 * If correct, returns userId and a token.
 */
exports.login = (req, res, next) => {
  User.findOne({
      email: req.body.email
    })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: "User not found"
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({
              error: "Incorrect password"
            });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ // creating a token for the new session; 
                userId: user._id // the method takes two arguments : 
              }, // a response object and
              process.env.TOKEN_SECRET, { // a secret key
                expiresIn: '24h'
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({
          error
        }));
    })
    .catch((error) => res.status(500).json({
      error
    }));
};

/**
 * displays user's data.
 * If the user's id does not match the one assigned to the user in Users Colection, 
 * the request is not authorized.
 */
exports.readUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          error: new Error("User not found!")
        });
      } else {
        res.status(200).json(user);
      }
    })
    .catch((error) => res.status(404).json({
      error
    }));
}

/**
 * Exports the user's data. Returns the data as a text file attached 
 * to the response. 
 */
exports.exportData = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          error: new Error("User not found!")
        });
      } else {
        const text = user.toString(); // returns the user object to string format
        res.attachment("user-data.txt");
        res.type("txt");
        return res.status(200).send(text);
      }
    })
    .catch((error) => res.status(404).json({
      error
    }));
}

/**
 * Updates the user data for an id given.
 * If userId from the request does not match the one stored in database, the request
 * is not authorized.
 */
exports.updateUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          error: new Error("User not found!")
        });
      } else {
        User.findByIdAndUpdate({
            _id: req.auth.userId
          }, {
            ...req.body
          }, {
            new: true
          })
          .then((userUpdated) => res.status(200).json(
            userUpdated
          ))
          .catch((error) => {
            res.status(400).json({
              error: error
            });
          });
      }
    })
    .catch((error) => res.status(404).json({
      error
    }));
}

/**
 * deletes the user data for an id given.
 * If userId from the request does not match the one stored in database, the request
 * is not authorized.
 */
exports.deleteUser = (req, res, next) => {
  User.findById(req.auth.userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          error: new Error("User not found!")
        });
      } else {
        User.deleteOne({
            _id: req.auth.userId
          })
          .then(() => {
            res.status(204).json()
          })
          .catch((error) => {
            res.status(400).json({
              error: error
            });
          });
      }
    })
    .catch((error) => res.status(404).json({
      error
    }));
}

/**
 * Reports a user for an id given. 
 * The id of the user who reports is added to the usersWhoReported array 
 * and the value of reports is increased by 1. No change if the id of the user who reports
 * is already present in the usersWhoReported array.
 */
exports.reportUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user.usersWhoReported.includes(req.auth.userId)) {
        User.findByIdAndUpdate({
            _id: req.params.id
          }, {
            $inc: {
              reports: 1
            },
            $push: {
              usersWhoReported: req.auth.userId
            }
          }, {
            new: true
          })
          .then((userUpdated) => res.status(200).json(userUpdated))
          .catch((error) => res.status(400).json({
            error
          }))
      } else {
        res
          .status(200)
          .json({
            message: "User already reported"
          });
      }
    })
    .catch()
}