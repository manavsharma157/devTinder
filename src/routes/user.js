const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");

const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "photoUrl",
  "bio",
  "skills",
];

//Get All the pending connection requests for all the logged in users
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA); // Populate fromUserId with user details
    //Populate and ref are just like joins
    // Just because i created the link between the user and connection models , i dont need to do any looping to get the user details
    // mongoose will automatically fetch the user details from the user collection and add it to the fromUserId field
    // console.log(requests);
    res.json({ requests });
  } catch (err) {
    res.status(500).send("Error fetching users: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId toUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA); // Populate fromUserId with user details
    //Populate and ref are just like joins  
    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });
    res.json({ data });
  } catch (err) {
    res.status(500).send("Error fetching connections: " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try{
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 100)
    {
      limit = 100; // Set a maximum limit to prevent abuse
    }
    const skip = (page - 1) * limit;
    // Find all connection requests involving the logged-in user
    // Exclude users who have sent or received connection requests to/from the logged-in user
    // Exclude the logged-in user themselves
    // Return the remaining users as the feed
    const connectionRequests = await ConnectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id },
      ]
    }).select("fromUserId toUserId");
    
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId.toString());
      hideUsersFromFeed.add(request.toUserId.toString());
    });

    const users = await User.find({
      $and: [ { _id: { $ne: loggedInUser._id } }, // Exclude logged-in user
      { _id: { $nin: Array.from(hideUsersFromFeed) } } // Exclude users with connection requests
    ]
    }).select(USER_SAFE_DATA).skip(skip).limit(limit);

    res.json({ data: users });

  }
  catch(err){
    res.status(400).send("Error getting feed: " + err.message);
  }
});

module.exports = userRouter;
