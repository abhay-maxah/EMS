import express from "express";
import {
  punchIn,
  punchOut,
  applyLeave,
  approveLeave,
  getLeavesByUser,
  getAllLeaves,
  getUserReport,
} from "../controllers/attendance.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const attendanceRoutes = express.Router();

attendanceRoutes.post("/punch-in", protectRoute, punchIn);
attendanceRoutes.post("/punch-out", protectRoute, punchOut);
attendanceRoutes.post("/apply-leave", protectRoute, applyLeave);
attendanceRoutes.patch("/approve-leave/:attendanceId", protectRoute, adminRoute, approveLeave);

attendanceRoutes.get("/my-leaves", protectRoute, getLeavesByUser);
attendanceRoutes.get("/all-leaves", protectRoute, adminRoute, getAllLeaves);

attendanceRoutes.get("/report/:id", protectRoute, getUserReport); // Admin or user
attendanceRoutes.get("/report", protectRoute, getUserReport); // Self-report

export default attendanceRoutes;
