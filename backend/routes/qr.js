const express = require("express");
const jwt = require("jsonwebtoken");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/qr/generate
 * Generate QR token for student
 */
router.post(
  "/generate",
  authMiddleware,
  requireRole("student"),
  async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      // Validate location
      if (!latitude || !longitude) {
        return res
          .status(400)
          .json({ error: "Location (latitude, longitude) is required" });
      }

      // Generate QR token with student info and location
      const qrToken = jwt.sign(
        {
          studentId: req.user._id,
          studentIdNumber: req.user.studentId,
          name: req.user.name,
          location: {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
          },
          issuedAt: Date.now(),
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.QR_TOKEN_EXPIRES_IN }
      );

      res.json({
        qrToken,
        expiresIn: process.env.QR_TOKEN_EXPIRES_IN,
        student: {
          id: req.user._id,
          studentId: req.user.studentId,
          name: req.user.name,
        },
      });
    } catch (error) {
      console.error("QR generation error:", error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  }
);

module.exports = router;
