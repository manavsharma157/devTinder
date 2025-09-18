const express = require("express");
const app = express(); //instance of an express application
//importing the database connection function
const connectDB = require("./config/database");

const User = require("./models/user");

const { validateSignupData } = require("./utils/validation");

const bcrypt = require("bcrypt");

const cookieParser = require("cookie-parser");

const jwt = require("jsonwebtoken");

const { userAuth } = require("./middlewares/auth");

// const express = require('express');

// const app = express(); //instance of an express application

// //Server will respond to the incoming request from the browser on localhost:3000
// // By default it will even respond to localhost:3000/hello, localhost:3000/home....
// // app.use((req, res) => {
// //     res.send("Hello from the server");
// // })

// //specific to localhost:300/test
// app.use("/test",(req, res) => {
//     res.send("Hello from the server");
// })

app.use(express.json()); //middleware to parse incoming JSON request bodies
app.use(cookieParser()); //middleware to parse cookies from incoming requests
//Route to handle user signup
app.post("/signup", async (req, res) => {
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

//to find one user by email id
app.get("/user", async (req, res) => {
  try {
    const users = await User.findOne({ emailId: req.body.emailId });
    res.send(users);
  } catch {
    res.status(500).send("Error fetching users");
  }
});

//to get all users
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({}); // Fetch all users from the database
    if (!users) {
      res.status(404).send("No users found");
    } else {
      res.send(users);
    }
  } catch {
    res.status(500).send("Error fetching users");
  }
});

//to delete a user by id
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId); //(uerId) or ({_id: userId})
    if (!user) {
      return res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully");
    }
  } catch {
    res.status(500).send("Error deleting user");
  }
});

//Update data of the user
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "before",
      runValidators: true,
    });
    console.log(user);
    const ALLOWED_UPDATES = [
      "userId",
      "age",
      "bio",
      "skills",
      "photoUrl",
      "gender",
    ];

    const isUpdateAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );

    if (!user) {
      throw new Error("User not found");
    }

    if (!isUpdateAllowed) {
      throw new Error("Updates not allowed!");
    }

    if (data.skills && data?.skills.length > 5) {
      throw new Error("Sklills cannot be more than 5");
    }

    res.send("User updated successfully");
  } catch (err) {
    res.status(500).send("Error updating user: " + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      // Create a JWT token
      const token = await jwt.sign({ _id: user._id }, "DEV@Tinder2025", { expiresIn : "7d"});

      // Addd the token to cookie and send the response to the user
      res.cookie("token", token, {expires : new Date(Date.now() + 7 * 3600000), httpOnly: true}); //cookie will be valid for 8 hours

      res.send("User logged in successfully");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});

//added userAuth middleware to protect this route
//the route will execute only if next() is called from the middleware
app.get("/profile", userAuth, async (req, res) => {
  //user can only access this route if they are logged in through cookies
  try {
    const user = req.user; //user is attached to the req object in the userAuth middleware
    res.send(user);
  } catch (err) {
    res.status(500).send("Error fetching profile: " + err.message);
  }
});

app.post("/sendconnectionRequest", userAuth, async (req, res) => {
  const user = req.user; //logged in user
  const { connectionId } = req.body; //id of the user to whom the request is to be sent
  res.send("Connection request sent");
});

/////////////////////////////////////////////////
//FIrst connect to the database and then start the server
connectDB()
  .then(() => {
    console.log("MongoDB connected");
    app.listen(3000, () => {
      console.log("Server is successfully listening on port 3000...");
    });
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });
