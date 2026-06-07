const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is added by the authentication middleware.
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return next();
  };
};

module.exports = {
  authorize,
};
