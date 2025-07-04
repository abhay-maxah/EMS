import express from "express";
import {
  signup,
  login,
  getProfile,
  getAllUsers,
  deleteUserById,
  updateTeam
} from "../controllers/auth.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/profile", protectRoute, getProfile);
authRoutes.patch("/:id/update-team", protectRoute, adminRoute, updateTeam);
authRoutes.get("/all", protectRoute, adminRoute, getAllUsers);
authRoutes.delete("/:userId", protectRoute, adminRoute, deleteUserById);

export default authRoutes;
