const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  //user can only access this route if they are logged in through cookies
  try {
    const user = req.user; //user is attached to the req object in the userAuth middleware
    res.send(user);
  } catch (err) {
    res.status(500).send("Error fetching profile: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edits!");
    }
    const loggedUser = req.user;
    const data = req.body;
    // console.log(loggeduser);
    Object.keys(data).forEach((key) => {
      loggedUser[key] = data[key];
    });
    loggedUser.save();
    res.send(`${loggedUser.firstName}, your profile has updated successfully`);
  } catch (err) {
    res.status(500).send("Error updating profile: " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const { oldPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(oldPassword, loggedUser.password);
    if (!isMatch) {
      throw new Error("Incorrect old password");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10); //hashing the password with salt rounds of 10
    loggedUser.password = passwordHash;
    await loggedUser.save();
    res.send("Password updated successfully");
  } catch (err) {
    res.status(500).send("Error updating password: " + err.message);
  }
});


module.exports = profileRouter;
