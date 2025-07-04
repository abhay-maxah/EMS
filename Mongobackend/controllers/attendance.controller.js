import Attendance from "../models/attendance.model.js";
const calculateWorkingHours = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return "00:00:00";

  const diffMs = new Date(punchOut) - new Date(punchIn);
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// Punch In
export const punchIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ user: userId, date: today });
    if (existing && existing.punchIn) {
      return res.status(400).json({ message: "Already punched in today." });
    }

    const record = existing
      ? await Attendance.findOneAndUpdate(
        { user: userId, date: today },
        { punchIn: new Date() },
        { new: true }
      )
      : await Attendance.create({ user: userId, punchIn: new Date(), date: today });

    res.status(200).json({ message: "Punch in successful", record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Punch Out
export const punchOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ user: userId, date: today });

    if (!record || !record.punchIn || record.punchOut) {
      return res.status(400).json({ message: "Punch out not allowed" });
    }

    record.punchOut = new Date();
    await record.save();

    const workingHours = calculateWorkingHours(record.punchIn, record.punchOut);

    res.status(200).json({
      message: "Punch out successful",
      workingHours,
      record,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply Leave
export const applyLeave = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dates } = req.body; // expecting: ["2025-03-03", "2025-03-04"]

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: "No dates provided." });
    }

    const leaveRecords = [];

    for (let dateStr of dates) {
      const normalizedDate = new Date(dateStr);
      normalizedDate.setHours(0, 0, 0, 0);

      const record = await Attendance.findOneAndUpdate(
        { user: userId, date: normalizedDate },
        { leaveApplied: true },
        { upsert: true, new: true }
      );

      leaveRecords.push(record);
    }

    res.status(200).json({
      message: "Leave applied for selected dates.",
      leaves: leaveRecords,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Approve Leave (Admin only)
export const approveLeave = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const record = await Attendance.findByIdAndUpdate(
      attendanceId,
      { leaveApplied: false },
      { new: true }
    );

    res.status(200).json({ message: "Leave approved", record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Leaves for User
export const getLeavesByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const records = await Attendance.find({ user: userId, leaveApplied: true });
    res.status(200).json({ leaves: records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Leave Requests (Admin)
export const getAllLeaves = async (req, res) => {
  try {
    const records = await Attendance.find({ leaveApplied: true }).populate("user", "name email");
    res.status(200).json({ leaves: records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// View Report with Pagination
export const getUserReport = async (req, res) => {
  try {
    const { id } = req.params; // user ID for admin, optional
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = req.user.role === "admin" && id ? { user: id } : { user: req.user._id };

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Attendance.countDocuments(filter);

    const formatted = records.map((r) => ({
      date: r.date,
      punchIn: r.punchIn,
      punchOut: r.punchOut,
      leaveApplied: r.leaveApplied,
      workingHours: calculateWorkingHours(r.punchIn, r.punchOut),
    }));

    res.status(200).json({
      report: formatted,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

