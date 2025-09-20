const express = require("express");

const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");




authRouter.post("/signup", async (req, res) => {
  try {
    //Validation of Data
    validateSignupData(req);

    const { firstName, lastName, emailId, password, age } = req.body;

    //eNCRYPTION
    const passwordHash = await bcrypt.hash(password, 10); //hashing the password with salt rounds of 10

    //Encrypt the password before saving (recommended)

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
    }); // Creating a new user with this data

    // const user = new User(userObj); // Creating a new user with this data
    // //or we can say Creating a new instance of user model

    await user.save(); //saving the user to the database
    res.send("User signed up successfully");
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

authRouter.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.body.emailId });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // Create a JWT token

      // const token = await jwt.sign({ _id: user._id }, "DEV@Tinder2025", { expiresIn : "7d"});

      const token = await user.getJWT();
      // Addd the token to cookie and send the response to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 3600000),
        httpOnly: true,
      }); //cookie will be valid for 8 hours

      res.send("User logged in successfully");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
    try {
        res.cookie("token", null, {
        expires: new Date(Date.now()),
      }); 
        res.send("User logged out successfully");
    } catch (err) {
        res.status(500).send("Error logging out: " + err.message);
    }
});






module.exports = authRouter;