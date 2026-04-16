const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      photoUrl,
      bio,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender, 
      photoUrl, 
      bio, 
    });

    const savedUser = await user.save();

    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
    });

    res.json(savedUser);
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
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 3600000),
        httpOnly: true,
      }); 

      res.send(user);
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