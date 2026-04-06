const mongoose = require("mongoose");

//Connects to the db cluster
// This function returns a promise

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.DB_CONNECTION_SECRET,
    );
    console.log("Atlas Database Connected Successfully!");
  } catch (err) {
    console.error("Atlas Connection Error:", err.message);
  }
};


module.exports = connectDB;

// connectDB()
// .then(() => {
//     console.log("MongoDB connected");
// })
// .catch((err) => {
//     console.log("Failed to connect to MongoDB", err);
// });

// module.exports = connectDB;