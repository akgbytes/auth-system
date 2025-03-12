import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";
import sendMail from "../utils/sendMail.js";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // validating inputs
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    // checking if user already exists in db
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({
        message: "User already exists, Please try to login!",
        success: false,
      });

    // creating user in db
    const user = await User.create({
      name,
      email,
      password,
    });

    if (!user)
      return res.status(400).json({
        message: "Please register again!",
        success: false,
      });

    // creating verificationToken
    const token = generateToken();
    user.verificationToken = token;
    await user.save();

    // sending email
    await sendMail(token, user.email);

    res.status(200).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;
  if (!token)
    return res.status(400).json({
      message: "Invalid token",
      success: false,
    });

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user)
      return res.status(400).json({
        message: "Invalid token",
        success: false,
      });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({
      message: "User verified successfully!",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

export { registerUser, verifyUser };
