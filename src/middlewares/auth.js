const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  // Read the token from the req cookies
  try {
    const cookies = req.cookies;

    const { token } = cookies;
    if (!token) {
        throw new Error("No token found");
    }
    // Validate my token
    const decodedObj = await jwt.verify(token, "DEV@Tinder2025");

    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    } else {
        req.user = user; //attach the user to the req object
      next();
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }

  // Validate the token
  // Find the user
};

module.exports = {
  userAuth,
};
