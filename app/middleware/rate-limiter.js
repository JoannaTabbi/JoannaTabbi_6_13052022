/**limits the numer of request per 15min to avoid the brute-force hacking.
 * When the limit is reached, it sends back the statusCode 4529 
 * ("too many requests") and the message (default option).
 */
const rateLimit = require('express-rate-limit');
const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 6, // Limit each IP to 6 requests per `window` (here, per 15 minutes)
	message: "Login error, you have reached maximum retries. Please try again after 15 minutes",
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = rateLimiter;