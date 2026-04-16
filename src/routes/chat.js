const express = require("express");
const chatRouter = express.Router();
const Chat = require("../models/chat ");
const { userAuth } = require("../middlewares/auth");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    })
      .populate("participants", "firstName lastName") // ADD THIS LINE
      .populate({
        path: "messages.sender",
        select: "firstName lastName",
      });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
      
      // After saving, we should populate the new chat too 
      // so the frontend doesn't break on the first message
      chat = await chat.populate("participants", "firstName lastName");
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chat" });
  }
});

module.exports = chatRouter;