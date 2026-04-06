const jwt = require("jsonwebtoken");
const User = require("../models/user");


const userAuth = async (req, res, next) => {
  // Read the token from the req cookies
  try {
    const cookies = req.cookies;

    const { token } = cookies;
    if (!token) {
        return res.status(401).send("Access denied. Please Login.");
    }
    // Validate my token
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET_KEY );
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
