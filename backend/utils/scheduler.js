const cron = require("node-cron");
const Attendance = require("../models/Attendance");

/**
 * Auto-exit students who have been inside for more than 1 hour
 * Runs every 5 minutes
 */
const startAutoExitScheduler = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Find all records that are still inside and entered more than 1 hour ago
      const expiredRecords = await Attendance.find({
        status: "inside",
        timeIn: { $lt: oneHourAgo },
      });

      if (expiredRecords.length > 0) {
        console.log(
          `🕐 Auto-exiting ${expiredRecords.length} students due to timeout`
        );

        // Update all expired records
        await Attendance.updateMany(
          {
            status: "inside",
            timeIn: { $lt: oneHourAgo },
          },
          {
            $set: {
              status: "exited",
              timeOut: new Date(),
              exitType: "timeout",
            },
          }
        );

        console.log(
          `✅ Auto-exit completed for ${expiredRecords.length} students`
        );
      }
    } catch (error) {
      console.error("❌ Auto-exit scheduler error:", error.message);
    }
  });

  console.log("🚀 Auto-exit scheduler started (runs every 5 minutes)");
};

module.exports = { startAutoExitScheduler };
