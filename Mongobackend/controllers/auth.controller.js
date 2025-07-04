import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Signup Controller
export const signup = async (req, res) => {
  const { name, email, password, role="user", } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({ name, email, password, role });

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "User signed up successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// Get Profile
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: "Failed to get profile", details: error.message });
  }
};

// Admin: Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to get users", details: error.message });
  }
};

// Admin: Delete User by ID
export const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User with id ${userId} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user", details: error.message });
  }
};

//Admin : add the user in team
export const updateTeam = async (req, res) => {
  try {
    const { team } = req.body;
    const { id } = req.params;

    if (!team) {
      return res.status(400).json({ message: "Team is required" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.team = team;
    await user.save();

    res.status(200).json({
      message: "Team updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        team: user.team,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update team", details: error.message });
  }
};
