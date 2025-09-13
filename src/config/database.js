const mongoose = require("mongoose");

// mongoose.connect(
//   "mongodb+srv://manav157sh_db_user:Manav1234@test.zuwnpwj.mongodb.net/devTinder"
// );
//Connects to the db cluster
// This function returns a promise

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://manav157sh_db_user:Manav1234@test.zuwnpwj.mongodb.net/devTinder"
  );  
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