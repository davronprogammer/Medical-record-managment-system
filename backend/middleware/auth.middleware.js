const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {

  let token = req.cookies && req.cookies.token;

  // If there is no cookie token, check the Authorization header.
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;

    // Bearer tokens should look like: "Bearer token_here"
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    // If the token is valid, decoded contains the logged-in user data.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = {
  authenticate,
};
