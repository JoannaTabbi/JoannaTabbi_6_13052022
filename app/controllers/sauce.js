const Sauce = require("../models/sauce");

exports.getOneSauce = (req, res, next) => {
  const id = req.params.id;
  Sauce.findById(id)
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }))
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }))
};

/* exports.createSauce = (req, res, next) => {
  delete req.body._id;
  const sauce = new Sauce({
  ...req.body
  });
  sauce.save()
  .then(newSauce => res.status(201).json({newSauce}))
  .catch(error => res.status(400).json({error}))
} */