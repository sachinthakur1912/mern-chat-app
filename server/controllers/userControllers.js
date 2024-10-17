const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { name, email, password, confirmPassword, pic } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      pic,
    });
    if (newUser) {
      return res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not registered" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        user: {
          id: user._id,
          email: user.email,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "5d",
      });
      user.token = token;
      user.password = undefined;
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        message: "User logged in successfully",
        user,
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "internal server error",
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            {
              name: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              email: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
        }
      : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user.id } });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
