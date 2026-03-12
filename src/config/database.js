const mongoose = require("mongoose");

//Connects to the db cluster
// This function returns a promise

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb://manav157sh_db_user:Manav1234@ac-cynnoen-shard-00-00.zuwnpwj.mongodb.net:27017,ac-cynnoen-shard-00-01.zuwnpwj.mongodb.net:27017,ac-cynnoen-shard-00-02.zuwnpwj.mongodb.net:27017/devTinder?ssl=true&replicaSet=atlas-7lnpfs-shard-0&authSource=admin&appName=test"
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