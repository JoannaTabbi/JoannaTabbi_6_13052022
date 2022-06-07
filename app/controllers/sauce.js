const fs = require("fs");
const Sauce = require("../models/sauce");

/**
 * create hateoas links for sauces
 */
 const hateoasLinks = (req, id) => {
  const URI = `${req.protocol}://${req.get("host") + "/api/sauces/"}`;
  return [
    {
      rel: "readOne",
      title: "ReadOne",
      href: URI + id,
      method: "GET"
    },
    {
      rel: "readAll",
      title: "ReadAll",
      href: URI,
      method: "GET"
    },
    {
      rel: "create",
      title: "Create",
      href: URI,
      method: "POST"
    },
    {
      rel: "like",
      title: "Like",
      href: URI + id + "/like",
      method: "POST"
    },
    {
      rel: "update",
      title: "Update",
      href: URI + id,
      method: "PUT"
    },
    {
      rel: "delete",
      title: "Delete",
      href: URI + "/",
      method: "DELETE"
    },
    {
      rel: "report",
      title: "Report",
      href: URI + id + "/report",
      method: "POST"
    }
  ]
}

/**
 * returns the sauce for an id given; 
 * converts its imageURL to suit the request's protocol.
 */
exports.readOneSauce = (req, res, next) => {
  Sauce.findById(req.params.id)
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host")}${sauce.imageUrl}`;
      res.status(200).json({
        sauce,
        hateoasLinks: hateoasLinks(req, sauce._id) 
      });
    })
    .catch((error) => res.status(404).json({
      error
    }));
};

/**
 * returns an array of all the sauces from the Sauce collection; 
 * converts the imageURLs to suit the request protocol;
 */
exports.readAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      sauces = sauces.map((sauce) => {
        sauce.imageUrl = `${req.protocol}://${req.get("host")}${
          sauce.imageUrl
        }`;
        return {...sauce._doc};
      });
      res.status(200).json(sauces);
    })
    .catch((error) => res.status(400).json({
      error
    }));
};

/**
 * Creates and adds a new sauce to the Sauce collection. 
 * The image and the sauce objet are mandatory.
 * The id of the sauce creator (userId) is added systematically to the sauce.
 */
exports.createSauce = (req, res, next) => {
  if (!req.file) {
    return res.status(422).json({
      message: "The image is mandatory"
    });
  }
  if (!req.body.sauce) {
    return res.status(422).json({
      message: "The sauce object is mandatory"
    });
  }
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `/images/${req.file.filename}`
  });
  sauce
    .save()
    .then((newSauce) => res.status(201).json({
      newSauce,
      hateoasLinks: hateoasLinks(req, sauce._id)
    }))
    .catch((error) => res.status(400).json({
      error
    }));
};

/**
 * Adds or removes a like or a dislike given by a user to a sauce.
 * If like = 1, the user likes the sauce : his like is added to the value of likes and 
 * the user's id is added to the usersLiked array. If like = -1, the user dislikes the sauce : 
 * his dislike is added to the value of dislikes and his id to the usersDisliked array.
 * If like = 0, the user resets his vote; his like or dislike is removed from the 
 * likes / dislikes value and his Id : from the usersLiked or usersDisliked array. 
 */
exports.likeSauce = (req, res, next) => {
  Sauce.findById(req.params.id)
    .then((sauceFound) => {
      const userId = req.auth.userId;
      const usersLikedExists = sauceFound.usersLiked.includes(userId);
      const usersDislikedExists = sauceFound.usersDisliked.includes(userId);
      let toChange = {};
      switch (req.body.like) {
        case -1:
          toChange = {
            $inc: {
              dislikes: 1
            },
            $push: {
              usersDisliked: userId
            }
          };
          if (usersLikedExists) {
            toChange = {
              $inc: {
                dislikes: 1,
                likes: -1
              },
              $push: {
                usersDisliked: userId
              },
              $pull: {
                usersLiked: userId
              }
            };
          }
          if (!usersDislikedExists) {
            Sauce.findByIdAndUpdate({
                _id: req.params.id
              }, toChange, {
                new: true
              })
              .then((sauceUpdated) => res.status(200).json({
                sauceUpdated,
                hateoasLinks: hateoasLinks(req, sauceUpdated._id)
              }))
              .catch((error) => res.status(400).json({
                error
              }));
          } else {
            res
              .status(200)
              .json({
                message: "User has already disliked the sauce"
              });
          }
          break;
        case 0:
          if (usersLikedExists && usersDislikedExists) {
            Sauce.findByIdAndUpdate({
                  _id: req.params.id
                },
                (toChange = {
                  $inc: {
                    dislikes: -1,
                    likes: -1
                  },
                  $pull: {
                    usersLiked: userId,
                    usersDisliked: userId
                  }
                }), {
                  new: true
                }
              )
              .then((sauceUpdated) => res.status(200).json({
                sauceUpdated,
                hateoasLinks: hateoasLinks(req, sauceUpdated._id)
              }))
              .catch((error) => res.status(400).json({
                error
              }));
          } else if (usersLikedExists) {
            Sauce.findByIdAndUpdate({
                  _id: req.params.id
                },
                (toChange = {
                  $inc: {
                    likes: -1
                  },
                  $pull: {
                    usersLiked: userId
                  }
                }), {
                  new: true
                }
              )
              .then((sauceUpdated) => res.status(200).json({
                sauceUpdated,
                hateoasLinks: hateoasLinks(req, sauceUpdated._id)
              }))
              .catch((error) => res.status(400).json({
                error
              }));
          } else if (usersDislikedExists) {
            Sauce.findByIdAndUpdate({
                  _id: req.params.id
                },
                (toChange = {
                  $inc: {
                    dislikes: -1
                  },
                  $pull: {
                    usersDisliked: userId
                  }
                }), {
                  new: true
                }
              )
              .then((sauceUpdated) => res.status(200).json({
                sauceUpdated,
                hateoasLinks: hateoasLinks(req, sauceUpdated._id)
              }))
              .catch((error) => res.status(400).json({
                error
              }));
          } else {
            res.status(200).json({
              message: "User's vote is already reset"
            });
          }
          break;
        case 1:
          toChange = {
            $inc: {
              likes: 1
            },
            $push: {
              usersLiked: userId
            }
          };
          if (usersDislikedExists) {
            toChange = {
              $inc: {
                dislikes: -1,
                likes: 1
              },
              $pull: {
                usersDisliked: userId
              },
              $push: {
                usersLiked: userId
              }
            };
          }
          if (!usersLikedExists) {
            Sauce.findByIdAndUpdate({
                _id: req.params.id
              }, toChange, {
                new: true
              })
              .then((sauceUpdated) => res.status(200).json({
                sauceUpdated,
                hateoasLinks: hateoasLinks(req, sauceUpdated._id)
              }))
              .catch((error) => res.status(400).json({
                error
              }));
          } else {
            res
              .status(200)
              .json({
                message: "User has already liked the sauce"
              });
          }
          break;
      }
    })
    .catch((error) => res.status(404).json({
      error
    }));
};

/**
 * Updates the sauce for an ID given. 
 * If the image file is present, it is captured and its URL is updated, while
 * the ancient image is definitely removed from the image folder.
 * If no file is given, the sauce elements are present directly in the request body.
 * If a file is given, the sauce elements  are transmitted by req.body.sauce.
 * If UserId of the request does not match the one of the sauce creator, 
 * the request is not authorized.
 */
exports.updateSauce = (req, res, next) => {
  Sauce.findById(req.params.id).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No such Sauce!")
      });
    } else if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Unauthorized request!")
      });
    } else {
      const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `/images/${req.file.filename}`
      } : {
        ...req.body
      };
      const filename = sauce.imageUrl.split("/images/")[1];
      try {
        if (sauceObject.imageUrl) {
          fs.unlinkSync(`images/${filename}`)
        }
      } catch (error) {
        console.log(error);
      }
      Sauce.findByIdAndUpdate({
          _id: req.params.id
        }, {
          ...sauceObject,
          _id: req.params.id
        }, {
          new: true
        })
        .then((sauceUpdated) => res.status(200).json({
          sauceUpdated,
          hateoasLinks: hateoasLinks(req, sauceUpdated._id)
        }))
        .catch((error) => res.status(400).json({
          error
        }));


    }
  });
};

/**
 * deletes the sauce for an id given.
 * The image file is removed definitely from the image folder. 
 * If userId from the request does not match the one of the sauce creator, the request
 * is not authorized.
 */

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No such Sauce!")
      });
    } else if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Unauthorized request!")
      });
    } else {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({
            _id: req.params.id
          })
          .then(() => {
            res.status(204).json()
          })
          .catch((error) => {
            res.status(400).json({
              error: error
            });
          });
      });
    }
  });
};

/**
 * Reports a sauce for an id given. 
 * The id of the user who reports is added to the usersWhoReported array 
 * and the value of reports is increased by 1. No change if the id of the user who reports
 * is already present in the usersWhoReported array.
 */
exports.reportSauce = (req, res, next) => {
  Sauce.findById(req.params.id)
    .then((sauce) => {
      if (!sauce.usersWhoReported.includes(req.auth.userId)) {
        Sauce.findByIdAndUpdate({
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
          .then((sauceUpdated) => res.status(200).json({
            sauceUpdated,
            hateoasLinks: hateoasLinks(req, sauceUpdated._id)}))
          .catch((error) => res.status(400).json({
            error
          }))
      } else {
        res
          .status(200)
          .json({
            message: "Sauce already reported"
          });
      }
    })
    .catch()
}