const express = require("express");
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/users
 * Get all users (admin/staff only)
 */
router.get(
  "/",
  authMiddleware,
  requireRole("staff", "admin"),
  async (req, res) => {
    try {
      const { role } = req.query;

      const filter = {};
      if (role) {
        filter.role = role;
      }

      const users = await User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 });

      res.json({
        users,
        count: users.length,
      });
    } catch (error) {
      console.error("Users fetch error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Students can only view their own profile
    if (
      req.user.role === "student" &&
      req.user._id.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ user });
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;
