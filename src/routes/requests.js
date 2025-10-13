const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id; //logged in user
      const toUserId = req.params.toUserId;
      const status = req.params.status; //accepted or rejected

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Status not allowed");
      }

      //Check if the ToUser exists or not
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        throw new Error("User not found");
      }

      //check if a request already exists
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        throw new Error("Request already sent");
      }

      if (fromUserId === toUserId) {
        throw new Error("You cannot send request to yourself");
      }

      //create a new connection request
      const connectionReq = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionReq.save();
      res.json({
        // message: "Request sent successfully",
        message: status===("interested")
          ? `${req.user.firstName} is interested in ${toUser.firstName}`
          : `${req.user.firstName} ignored ${toUser.firstName}`,
        data,
      });
      //
    } catch (err) {
      res.status(500).send("Error sending request: " + err.message);
    }
  }
);

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const status = req.params.status; //accepted or rejected

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      throw new Error("Status not allowed");
    }

    const requestId = req.params.requestId;
    
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested"
    })
    if (!connectionRequest) {
      throw new Error("No pending request found");
    }

    connectionRequest.status = status;
   const data = await connectionRequest.save();
  res.json({ message: `Request ${status} successfully`, data });

  }
  catch (err) {
    res.status(500).send("Error reviewing request: " + err.message);
  }


});
module.exports = requestRouter;
