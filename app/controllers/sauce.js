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
      const like = req.body.like === 1;
      const voteReset = req.body.like === 0;
      const dislike = req.body.like === -1;
      const userId = req.body.userId;
      const usersLikedExists = sauceFound.usersLiked.includes(userId);
      const usersDislikedExists = sauceFound.usersDisliked.includes(userId);
      const userChoice = true;
      // différents cas de figure / résultat
      switch (userChoice) {
        //le client aime la sauce, mais il figure déjà sur la liste de userLiked et userDisliked / le dislike est enlevé
        case usersLikedExists && like && usersDislikedExists:
        //le client remet le vote à zéro, alors qu'il figure sur la liste des userDisliked
        case !usersLikedExists && voteReset && usersDislikedExists: {
          Sauce.updateOne(
            { _id: id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "dislike removed" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //le client aime la sauce, mais il figure déjà sur la liste des usersLiked
        case usersLikedExists && like && !usersDislikedExists: {
          throw "The user has already liked this sauce";
        }
        //le client aime la sauce, alors qu'il figure sur la liste des usersDisliked
        case !usersLikedExists && like && usersDislikedExists: {
          Sauce.updateOne(
            { _id: id },
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
        //le client aime la sauce, il n'a pas exprimé de vote auparavant
        case !usersLikedExists && like && !usersDislikedExists: {
          Sauce.updateOne(
            { _id: id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "like added" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //le client n'aime pas la sauce, alors qu'il figure parmi usersLiked et usersDisliked
        case usersLikedExists && dislike && usersDislikedExists:
        //le client remet son vote à zéro, alors qu'il figure sur la liste des usersLiked
        case usersLikedExists && voteReset && !usersDislikedExists: {
          Sauce.updateOne(
            { _id: id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "like removed" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //le client n'aime pas la sauce, alors qu'il avait déjà mis un like auparavant
        case usersLikedExists && dislike && !usersDislikedExists: {
          Sauce.updateOne(
            { _id: id },
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
        //le client n'aime pas la sauce, alors qu'il avait déjà mis un dislike auparavant
        case !usersLikedExists && dislike && usersDislikedExists: {
          throw "The user has already disliked this sauce!";
        }
        //le client n'aime pas la sauce, il n'avait pas encore voté auparavant
        case !usersLikedExists && dislike && !usersDislikedExists: {
          Sauce.updateOne(
            { _id: id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: userId },
            }
          )
            .then(() => res.status(201).json({ message: "dislike added" }))
            .catch((error) => res.status(400).json({ error }));
          break;
        }
        //le client remet son vote à zéro, alors qu'il figure sur les listes de usersLiked et usersDisliked
        case usersLikedExists && voteReset && usersDislikedExists: {
          Sauce.updateOne(
            { _id: id },
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
        //le client remet son vote à zéro, mais il n'a pas encore voté auparavant
        case !usersLikedExists && voteReset && !usersDislikedExists: {
          throw "User's vote is already reset";
        }
        //la valeur de "like" n'est pas égale à 1, 0 ou -1
        case !like || !dislike || !voteReset: {
          throw "Error : 'like' value must be a number equal to 1, 0 or -1";
        }
        default:
          throw "Unknown error";
      }
    })
    .catch((error) => res.status(404).json({ error }));
};
