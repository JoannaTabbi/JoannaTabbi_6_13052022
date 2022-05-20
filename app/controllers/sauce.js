const Sauce = require("../models/sauce");

//displays a single sauce
exports.getOneSauce = (req, res, next) => {
  const id = req.params.id;
  Sauce.findById(id)
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//displays all the sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// adds a new sauce
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

// control user's vote (like / dislike / vote reset)
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

      switch (true) {
        //user likes, usersLiked and usersDisliked already exist =>  removes dislike
        case usersLikedExists && like && usersDislikedExists:
        //user resets his vote, dislike already exists => removes dislike
        case !usersLikedExists && voteReset && usersDislikedExists: {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "dislike removed" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //user likes, userLiked already exists => no change
        case usersLikedExists && like && !usersDislikedExists: {
          throw "The user has already liked this sauce";
        }
        //user likes, userDisliked already exists => adds like and removes dislike
        case !usersLikedExists && like && usersDislikedExists: {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1, dislikes: -1 },
              $push: { usersLiked: userId },
              $pull: { usersDisliked: userId },
            }
          )
            .then(() =>
              res.status(201).json({ message: "like added, dislike removed" })
            )
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //user likes, neither userLiked nor userDisliked exist yet => adds like
        case !usersLikedExists && like && !usersDislikedExists: {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "like added" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //user dislikes, userLiked and userDisliked already exist => removes like
        case usersLikedExists && dislike && usersDislikedExists:
        //user resets his vote, usersLiked already exists => removes like
        case usersLikedExists && voteReset && !usersDislikedExists: {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "like removed" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //user dislikes, userLiked already exists => removes like, adds dislike
        case usersLikedExists && dislike && !usersDislikedExists: {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1, dislikes: 1 },
              $pull: { usersLiked: userId },
              $push: { usersDisliked: userId },
            }
          )
            .then(() =>
              res.status(201).json({ message: "dislike added, like removed" })
            )
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //user dislikes, userDisliked already exists => no change
        case !usersLikedExists && dislike && usersDislikedExists: {
          throw "The user has already disliked this sauce!";
        }
        //user dislikes, neither userLiked nor userDisliked exist yet => adds dislike
        case !usersLikedExists && dislike && !usersDislikedExists: {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "dislike added" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //user resets his vote, userLiked and userDisliked already exist => removes like and dislike
        case usersLikedExists && voteReset && usersDislikedExists: {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1, dislikes: -1 },
              $pull: { usersLiked: userId, usersDisliked: userId },
            }
          )
            .then(() =>
              res.status(201).json({ message: "like and dislike removed" })
            )
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //user resets his vote, neither userLiked nor userDisliked exist yet => no change
        case !usersLikedExists && voteReset && !usersDislikedExists: {
          throw "User's vote is already reset";
        }
        //the vote isn't a number equal to 1, 0 or -1
        case !like || !dislike || !voteReset: {
          throw "Error : 'like' value must be a number equal to 1, 0 or -1";
        }
        default:
          throw "Unknown error";
      }
    })
    .catch((error) => res.status(404).json({ error }));
};
