const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

/**
 * setting the schema for a user
 */
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    reports: {
        type: Number,
        default: 0
    },
    usersWhoReported: [{
        type: String,
        ref: 'User'
    }]
});

/** 
 * checks for duplicate database entries and reports them 
 * like a validation error
 */
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);