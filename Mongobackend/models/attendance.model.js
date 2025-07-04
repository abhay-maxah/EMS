
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    punchIn: {
      type: Date,
    },
    punchOut: {
      type: Date,
    },
    leaveApplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance =  mongoose.model("Attendance", attendanceSchema);

export default Attendance;