import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassord = await bcrypt.hash(this.password, 10);
    this.password = hashedPassord;
    next();
  }
});

userSchema.methods.generateAccessAndRefreshToken = function () {
  const refreshToken = jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "24h",
  });

  const accessToken = jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "5min",
  });

  return { accessToken, refreshToken };
};

export default mongoose.model("User", userSchema);
