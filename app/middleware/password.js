/**
 * define a schema of valid password. This forces the user to create a strong password
 * with high security level and therefore minimises the risk of broken authentication.
 */
const passwordValidator = require('password-validator');

// Create a password schema
const passwordSchema = new passwordValidator();

// Add properties to it
passwordSchema
    .is().min(8) // Minimum length 8
    .is().max(100) // Maximum length 100
    .has().uppercase() // Must have uppercase letters
    .has().lowercase() // Must have lowercase letters
    .has().digits(2) // Must have at least 2 digits
    .has().not().spaces() // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

module.exports = (req, res, next) => {
    if (passwordSchema.validate(req.body.password)) {
        next();
    } else {
        const pwdValidError = passwordSchema.validate(req.body.password, {details: true});
        return res.status(400).json({
            error: pwdValidError
        })
    }
}