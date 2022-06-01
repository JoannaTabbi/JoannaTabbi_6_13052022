const jwt = require('jsonwebtoken');

/**
 * controls the authorization before passing to the next middleware.
 * extracts the user's token from request headers, then 
 * checks if it matches the one given while login
 */
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    //decodedToken verifies the token string value and the secret key
    // then returns a decoded object that we stored the token in
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;
    req.auth = {
      userId
    };
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(403).json({
      error: new Error('Unauthorized request!')
    });
  }
};