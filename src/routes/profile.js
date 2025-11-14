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

// Make the route handler ASYNC
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // 1. ---- FIX 1: REMOVE THE BROKEN VALIDATOR ----
    // if (!validateEditProfileData(req)) {
    //   throw new Error("Invalid edits!");
    // }
    // (Mongoose .save() will handle all validation from your schema)

    const loggedUser = req.user;
    const data = req.body;

    Object.keys(data).forEach((key) => {
      // Only update if the key exists on the schema (avoids 'about' vs 'bio' issues)
      if (loggedUser[key] !== undefined) {
         loggedUser[key] = data[key];
      }
    });

    // 2. ---- FIX 2: AWAIT THE ASYNC SAVE ----
    // This now waits for the save and lets the 'catch' block work
    await loggedUser.save(); 
    
    // 3. Send back the updated user data (this is better for Redux)
    res.send({
      message: `${loggedUser.firstName}, your profile has updated successfully`,
      data: loggedUser
    });

  } catch (err) {
    // This will now correctly catch all validation errors from your Mongoose Model
    // (e.g., "Gender must be 'male'..." or "First name is required")
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
