const getCurrentMealSession = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60;

  // Breakfast: 7:00 AM - 10:00 AM
  if (currentTime >= 7 && currentTime < 10) {
    return {
      sessionType: 'breakfast',
      startTime: '07:00',
      endTime: '10:00'
    };
  }

  // Lunch: 12:00 PM - 3:00 PM
  if (currentTime >= 12 && currentTime < 15) {
    return {
      sessionType: 'lunch',
      startTime: '12:00',
      endTime: '15:00'
    };
  }

  // Dinner: 7:00 PM - 10:00 PM
  if (currentTime >= 19 && currentTime < 22) {
    return {
      sessionType: 'dinner',
      startTime: '19:00',
      endTime: '22:00'
    };
  }

  return null; // No active meal session
};

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Check if given time is within meal session
 */
const isWithinMealSession = (sessionType) => {
  const current = getCurrentMealSession();
  return current && current.sessionType === sessionType;
};

module.exports = {
  getCurrentMealSession,
  getTodayDate,
  isWithinMealSession
};