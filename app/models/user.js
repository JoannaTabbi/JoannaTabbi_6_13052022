const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    reports: { type: Number, default: 0 },
    usersWhoReported: [{type: String, ref: 'User'}]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);