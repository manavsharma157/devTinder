const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { run: sendEmail } = require("../utils/sendEmail");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      console.log("==> Route hit! Sending request to:", req.params.toUserId);

      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        throw new Error("User not found");
      }

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Status not allowed");
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        throw new Error("Request already sent");
      }

      if (fromUserId.toString() === toUserId.toString()) {
        throw new Error("You cannot send request to yourself");
      }

      const connectionReq = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionReq.save();

      if (status === "interested") {
        try {
          const emailSubject = "New Connection Request from " + req.user.firstName;
          const emailBody = `<h1>Hi ${toUser.firstName},</h1>
                             <p>${req.user.firstName} is interested in your profile on DevTinder!</p>
                             <p>Login to your account to review the request.</p>`;

          await sendEmail(
            toUser.emailId,
            toUser.firstName,
            emailSubject,
            emailBody
          );

          console.log("==> Custom email sent to:", toUser.emailId);
        } catch (emailErr) {
          console.error("Email failed to send:", emailErr.message);
        }
      }

      res.json({
        message: status === "interested"
          ? `${req.user.firstName} is interested in ${toUser.firstName}`
          : `${req.user.firstName} ignored ${toUser.firstName}`,
        data,
      });

    } catch (err) {
      console.error("==> ERROR IN ROUTE:", err.message);
      res.status(500).send("Error sending request: " + err.message);
    }
  }
);

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const status = req.params.status;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      throw new Error("Status not allowed");
    }

    const requestId = req.params.requestId;

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested"
    });

    if (!connectionRequest) {
      throw new Error("No pending request found");
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.json({ message: `Request ${status} successfully`, data });

  } catch (err) {
    res.status(500).send("Error reviewing request: " + err.message);
  }
});

module.exports = requestRouter;