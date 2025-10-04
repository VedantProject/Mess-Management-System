const express = require("express");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { getCurrentMealSession, getTodayDate } = require("../utils/mealSession");
const { isWithinMessRadius } = require("../utils/distance");

const router = express.Router();

/**
 * POST /api/attendance/scan
 * Scan QR code for entry or exit
 */
router.post(
  "/scan",
  authMiddleware,
  requireRole("staff", "admin"),
  async (req, res) => {
    try {
      const { qrToken, staffLatitude, staffLongitude, scanType } = req.body;

      // Validate input
      if (!qrToken) {
        return res.status(400).json({ error: "QR token is required" });
      }

      if (!staffLatitude || !staffLongitude) {
        return res.status(400).json({ error: "Staff location is required" });
      }

      // Verify QR token
      let decoded;
      try {
        decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ error: "Invalid or expired QR code" });
      }

      // Get current meal session
      const session = getCurrentMealSession();
      if (!session) {
        return res
          .status(400)
          .json({ error: "No active meal session at this time" });
      }

      const today = getTodayDate();

      // Verify student exists
      const student = await User.findById(decoded.studentId);
      if (!student || student.role !== "student") {
        return res.status(404).json({ error: "Student not found" });
      }

      // Check if scan is for entry or exit
      if (scanType === "exit") {
        // Handle exit scan
        const activeRecord = await Attendance.findOne({
          student: decoded.studentId,
          date: today,
          sessionType: session.sessionType,
          status: "inside",
        });

        if (!activeRecord) {
          return res
            .status(400)
            .json({ error: "No active entry found for this session" });
        }

        // Mark as exited
        activeRecord.timeOut = new Date();
        activeRecord.status = "exited";
        activeRecord.exitType = "gate_scan";
        await activeRecord.save();

        return res.json({
          message: "Exit recorded successfully",
          attendance: activeRecord,
          student: {
            name: student.name,
            studentId: student.studentId,
          },
          session: session.sessionType,
        });
      }

      // Handle entry scan
      // Check if student already has an entry for this session today
      const existingEntry = await Attendance.findOne({
        student: decoded.studentId,
        date: today,
        sessionType: session.sessionType,
      });

      if (existingEntry) {
        return res.status(400).json({
          error: "Already marked for this session",
          message: `Student already entered ${
            session.sessionType
          } today at ${existingEntry.timeIn.toLocaleTimeString()}`,
          existingEntry,
        });
      }

      // Verify staff is within mess radius
      if (!isWithinMessRadius(staffLatitude, staffLongitude)) {
        return res.status(400).json({
          error: "Staff location is outside mess premises",
          message: "Please scan from within the mess area",
        });
      }

      // Create new attendance record
      const attendance = new Attendance({
        student: decoded.studentId,
        sessionType: session.sessionType,
        date: today,
        timeIn: new Date(),
        status: "inside",
        scannedBy: req.user._id,
        studentLocation: decoded.location,
        staffLocation: {
          lat: parseFloat(staffLatitude),
          lng: parseFloat(staffLongitude),
        },
      });

      await attendance.save();

      res.json({
        message: "Entry recorded successfully",
        attendance,
        student: {
          name: student.name,
          studentId: student.studentId,
        },
        session: session.sessionType,
      });
    } catch (error) {
      console.error("Scan error:", error);
      res.status(500).json({ error: "Failed to process scan" });
    }
  }
);

/**
 * POST /api/attendance/exit
 * Mark exit via geolocation or timeout
 */
router.post(
  "/exit",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      // Validate location
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Location is required" });
      }

      // Get current meal session
      const session = getCurrentMealSession();
      if (!session) {
        return res.status(400).json({ error: "No active meal session" });
      }

      const today = getTodayDate();

      // Find active attendance record
      const activeRecord = await Attendance.findOne({
        student: req.user._id,
        date: today,
        sessionType: session.sessionType,
        status: "inside",
      });

      if (!activeRecord) {
        return res
          .status(400)
          .json({ error: "No active entry found for current session" });
      }

      // Check if student is outside mess radius
      const isInside = isWithinMessRadius(latitude, longitude);

      if (isInside) {
        return res.status(400).json({
          error: "Still within mess premises",
          message: "Exit will be recorded when you leave the mess area",
        });
      }

      // Mark as exited via geolocation
      activeRecord.timeOut = new Date();
      activeRecord.status = "exited";
      activeRecord.exitType = "geolocation";
      await activeRecord.save();

      res.json({
        message: "Exit recorded via geolocation",
        attendance: activeRecord,
      });
    } catch (error) {
      console.error("Exit error:", error);
      res.status(500).json({ error: "Failed to record exit" });
    }
  }
);

/**
 * GET /api/attendance/stats
 * Get headcount statistics
 */
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const today = getTodayDate();
    const session = getCurrentMealSession();

    // Get counts for all sessions today
    const breakfast = await Attendance.countDocuments({
      date: today,
      sessionType: "breakfast",
    });

    const lunch = await Attendance.countDocuments({
      date: today,
      sessionType: "lunch",
    });

    const dinner = await Attendance.countDocuments({
      date: today,
      sessionType: "dinner",
    });

    // Get current session active count
    let currentActive = 0;
    if (session) {
      currentActive = await Attendance.countDocuments({
        date: today,
        sessionType: session.sessionType,
        status: "inside",
      });
    }

    res.json({
      date: today,
      currentSession: session ? session.sessionType : null,
      currentActive,
      sessionCounts: {
        breakfast,
        lunch,
        dinner,
      },
      total: breakfast + lunch + dinner,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

/**
 * GET /api/attendance/records
 * Get attendance records with filters
 */
router.get("/records", authMiddleware, async (req, res) => {
  try {
    const { date, sessionType, status } = req.query;
    const today = getTodayDate();

    const filter = {
      date: date || today,
    };

    if (sessionType) {
      filter.sessionType = sessionType;
    }

    if (status) {
      filter.status = status;
    }

    const records = await Attendance.find(filter)
      .populate("student", "name email studentId")
      .populate("scannedBy", "name email")
      .sort({ timeIn: -1 })
      .limit(100);

    res.json({
      records,
      count: records.length,
      filter,
    });
  } catch (error) {
    console.error("Records fetch error:", error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

/**
 * GET /api/attendance/my-records
 * Get attendance records for current student
 */
router.get(
  "/my-records",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    try {
      const records = await Attendance.find({ student: req.user._id })
        .sort({ timeIn: -1 })
        .limit(30);

      res.json({
        records,
        count: records.length,
      });
    } catch (error) {
      console.error("My records fetch error:", error);
      res.status(500).json({ error: "Failed to fetch your records" });
    }
  }
);

module.exports = router;
