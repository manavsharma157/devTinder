const express = require("express");

const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    // 1. Validate Data
    validateSignupData(req);

    // 2. Extract ALL fields (including gender, photoUrl, bio)
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

    // 3. Encrypt Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create User Instance
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

    // 5. CRITICAL STEP: Generate Token & Set Cookie
    // (So the user is logged in immediately after signup)
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
    });

    // 6. Send back the User Data (so Redux can update)
    // 6. Send back ONLY the User Data (so Redux works correctly)
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
