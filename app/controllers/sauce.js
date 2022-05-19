const Sauce = require("../models/sauce");

exports.getOneSauce = (req, res, next) => {
  const id = req.params.id;
  Sauce.findById(id)
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then((newSauce) => res.status(201).json({ newSauce }))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  /*frontend req: {
   "userId" : "",
   "like" : ""
 }
*/
  const id = req.params.id;
  Sauce.findById(id)
    .then((sauceFound) => {
      const like = req.body.like === 1;
      const voteReset = req.body.like === 0;
      const dislike = req.body.like === -1;
      const userId = req.body.userId;
      const usersLikedExists = sauceFound.usersLiked.includes(userId);
      const usersDislikedExists = sauceFound.usersDisliked.includes(userId);
      const userChoice = true;

      switch (userChoice) {
        case !usersLikedExists && like && usersDislikedExists: {
          // user who didn't liked yet, likes and removes his dislike
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1, dislikes: -1 },
              $push: { usersLiked: userId },
              $pull: { usersDisliked: userId },
            }
          )
            .then(() =>
              res.status(201).json({ message: "like ajouté, dislike enlevé" })
            )
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        case !usersLikedExists && like && !usersDislikedExists: {
          //user who didn't liked yet, likes
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "like ajouté" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        case !usersLikedExists && voteReset && usersDislikedExists: {
          //user who didn't liked yet, removes his dislike
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "dislike enlevé" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        case !usersLikedExists && dislike && !usersDislikedExists: {
          //user who didn't liked yet, dislikes
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "dislike ajouté" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        case usersLikedExists && voteReset && !usersDislikedExists: {
          //user who liked, removes his like
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "like enlevé" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        case usersLikedExists && dislike && !usersDislikedExists: {
          // user who liked, dislikes and removes his like
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1, dislikes: 1 },
              $pull: { usersLiked: userId },
              $push: { usersDisliked: userId },
            }
          )
            .then(() =>
              res.status(201).json({ message: "dislike ajouté, like enlevé" })
            )
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        default:
          throw "Une erreur est arrivée";
      }
    })

    .catch((error) => res.status(404).json({ error }));
};
