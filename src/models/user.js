const mongoose = require("mongoose");
// Uncomment to enable password hashing
// const bcrypt = require("bcrypt");

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // simple, pragmatic email check

const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [30, "First name must be at most 30 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [30, "Last name must be at most 30 characters"],
    },
    emailId: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          // return boolean — Mongoose will use the `message` if false
          return validator.isEmail(String(value));
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      validate: {
        validator: function (value) {
          // return boolean — Mongoose will use the `message` if false
          return validator.isStrongPassword(String(value));
        },
        message:
          "Weak password. Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol.",
      },
    },
    age: {
      type: Number,
      min: [18, "Minimum age is 18"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be 'male', 'female' or 'other'",
      },
    },
    photoUrl: {
      type: String,
      trim: true,
      default:
        "https://static.vecteezy.com/system/resources/previews/036/280/650/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg",
      validate: {
        validator: function (value) {
          // return boolean — Mongoose will use the `message` if false
          return validator.isURL(String(value));
        },
        message: "Invalid image format",
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, "Bio must be at most 300 characters"],
      default: "This is a default bio",
    },
    skills: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: "You can add up to 5 skills only.",
      },
    },
  },
  { timestamps: true }
);

//offloaded JWT creation to the model method
userSchema.methods.getJWT = async function () {
  const user = this;
  
  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder2025", { expiresIn : "7d"});

  
return token;
}
//offloaded password validation to the model method
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  return await bcrypt.compare(passwordInputByUser, passwordHash);
};


// Remove sensitive fields when converting to JSON (e.g., when sending user to client)
userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// Optional: hash password before saving (recommended).
// Uncomment if you want automatic hashing here. Install bcrypt: npm i bcrypt
/*
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
*/

// Optional instance method to compare passwords (useful for login)
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// Safe model registration to avoid OverwriteModelError in environments with hot reload
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
