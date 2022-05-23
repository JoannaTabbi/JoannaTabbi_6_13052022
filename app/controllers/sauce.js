const fs = require("fs");
const Sauce = require("../models/sauce");

//displays a single sauce
exports.readOneSauce = (req, res, next) => {
  const id = req.params.id;
  Sauce.findById(id)
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host")}${sauce.imageUrl}`;
      res.status(200).json(sauce);
    })
    .catch((error) => res.status(404).json({ error }));
};

//displays all the sauces
exports.readAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      sauces = sauces.map((sauce) => {
        sauce.imageUrl = `${req.protocol}://${req.get("host")}${
          sauce.imageUrl
        }`;
        return sauce;
      });
      res.status(200).json(sauces);
    })
    .catch((error) => res.status(400).json({ error }));
};

// adds a new sauce
exports.createSauce = (req, res, next) => {
  if (!req.file) {
    return res.status(422).json({ message: "The image is mandatory" });
  }
  if (!req.body.sauce) {
    return res.status(422).json({ message: "The sauce object is mandatory" });
  }
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `/images/${req.file.filename}`,
  });
  sauce
    .save()
    .then((newSauce) => res.status(201).json(newSauce))
    .catch((error) => res.status(400).json({ error }));
};

/* control user's vote (like / dislike / vote reset)
cette fonction met à jour le vote du client pour une sauce donnée en fonction de 3 paramètres :
- son vote (aime = 1, n'aime pas = -1, remise à zéro = 0 );
- avait-il déjà mis un like auparavant ? 
- avait-il déjà mis un dislike auparavant ? 
*/
exports.likeSauce = (req, res, next) => {
  /*frontend req: {
   "userId" : "",
   "like" : ""
 }
*/
  const id = req.params.id;
  Sauce.findById(id)
    .then((sauceFound) => {
      const userId = req.auth.userId;
      const usersLikedExists = sauceFound.usersLiked.includes(userId);
      const usersDislikedExists = sauceFound.usersDisliked.includes(userId);
      let toChange = {};
      switch (req.body.like) {
        case -1:
          toChange = {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: userId },
          };
          if (usersLikedExists) {
            toChange = {
              $inc: { dislikes: 1, likes: -1 },
              $push: { usersDisliked: userId },
              $pull: { usersLiked: userId },
            };
          }
          if (!usersDislikedExists) {
            Sauce.findByIdAndUpdate({ _id: id }, toChange, { new: true })
              .then((newSauce) => res.status(201).json(newSauce))
              .catch((error) => res.status(400).json({ error }));
          } else {
            res
              .status(200)
              .json({ message: "User has already disliked the sauce" });
          }
          break;
        case 0:
          if (usersLikedExists && usersDislikedExists) {
            Sauce.findByIdAndUpdate(
              { _id: id },
              (toChange = {
                $inc: { dislikes: -1, likes: -1 },
                $pull: { usersLiked: userId, usersDisliked: userId },
              }),
              { new: true }
            )
              .then((newSauce) => res.status(201).json(newSauce))
              .catch((error) => res.status(400).json({ error }));
          } else if (usersLikedExists) {
            Sauce.findByIdAndUpdate(
              { _id: id },
              (toChange = {
                $inc: { likes: -1 },
                $pull: { usersLiked: userId },
              }),
              { new: true }
            )
              .then((newSauce) => res.status(201).json(newSauce))
              .catch((error) => res.status(400).json({ error }));
          } else if (usersDislikedExists) {
            Sauce.findByIdAndUpdate(
              { _id: id },
              (toChange = {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: userId },
              }),
              { new: true }
            )
              .then((newSauce) => res.status(201).json(newSauce))
              .catch((error) => res.status(400).json({ error }));
          } else {
            res.status(200).json({ message: "User's vote is already reset" });
          }
          break;
        case 1:
          toChange = {
            $inc: { likes: 1 },
            $push: { usersLiked: userId },
          };
          if (usersDislikedExists) {
            toChange = {
              $inc: { dislikes: -1, likes: 1 },
              $pull: { usersDisliked: userId },
              $push: { usersLiked: userId },
            };
          }
          if (!usersLikedExists) {
            Sauce.findByIdAndUpdate({ _id: id }, toChange, { new: true })
              .then((newSauce) => res.status(201).json(newSauce))
              .catch((error) => res.status(400).json({ error }));
          } else {
            res
              .status(200)
              .json({ message: "User has already liked the sauce" });
          }
          break;
      }
    })
    .catch((error) => res.status(404).json({ error }));
};

//modifies one Sauce
exports.updateSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No such Sauce!"),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Unauthorized request!"),
      });
    }
    const sauceObject = req.file
      ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: `/images/${req.file.filename}`,
        }
      : { ...req.body };
    Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    )
      .then(() => res.status(200).json({ message: "Updated !" }))
      .catch((error) => res.status(400).json({ error }));
  });
};

//deletes one sauce

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No such Sauce!"),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Unauthorized request!"),
      });
    }
    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({
            message: "Deleted!",
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: error,
          });
        });
    });
  });
};
