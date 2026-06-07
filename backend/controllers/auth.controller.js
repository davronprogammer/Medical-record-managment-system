const jwt = require("jsonwebtoken");
const { readData } = require("../services/json.service");

const login = async (req, res) => {
  const { username, password } = req.body;

  const users = await readData("users.json");

  // For this beginner project, passwords are checked as plain text.
  const user = users.find((item) => {
    return item.username === username && item.password === password;
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  // Only store safe user information inside the token.
  const tokenData = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  // Return the token in the response body as well so cross-origin frontends
  // (e.g. served from :5500) can use the token in Authorization header.
  return res.json({
    success: true,
    message: "Login successful",
    user: tokenData,
    token,
  });
};

const logout = (req, res) => {
  res.clearCookie("token");

  return res.json({
    success: true,
    message: "Logout successful",
  });
};

module.exports = {
  login,
  logout,
};
