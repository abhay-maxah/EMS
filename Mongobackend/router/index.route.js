import express from 'express';
import authRoutes from './auth.route.js';
import attendanceRoutes from "./attendance.route.js";


const router = express.Router();

router.use('/api/v1/auth', authRoutes);
router.use("/api/v1/attendance", attendanceRoutes);


export default router;
