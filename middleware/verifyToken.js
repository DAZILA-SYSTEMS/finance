const jwt = require("jsonwebtoken");
const constants = require("../utils/const");
// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;

    jwt.verify(bearerToken, constants.jwtKey, (err, authData) => {
      if (err) {
        res.status(403).json({ message: "not logged in" });
      } else {
        req.userLogger = authData.user.logger;
        req.userId = authData.user.id;
        req.userLinker = authData.user.linker;
        // Next middleware
        next();
      }
    });
  } else {
    // Forbidden
    res.status(403).json({ message: "not logged in 1" });
  }
}

module.exports = verifyToken;
