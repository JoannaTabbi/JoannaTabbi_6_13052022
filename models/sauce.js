const mongoose = require('mongoose');
const Schema = mongoose.Schema

const sauceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper:{ type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true, min: 1, max: 10 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  usersLiked: { type: [String] },
  usersDisliked: { type: [String] }
});

module.exports = mongoose.model('Sauce', sauceSchema);