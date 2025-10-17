/**
 * Get the current active meal session based on the time of day
 */
const getCurrentMealSession = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60; // Convert to decimal hours

  // Breakfast: 7:00 AM - 9:00 AM
  if (currentTime >= 7 && currentTime < 9) {
    return {
      sessionType: 'breakfast',
      startTime: '07:00',
      endTime: '09:00'
    };
  }

  // Lunch: 12:00 PM - 2:00 PM
  if (currentTime >= 12 && currentTime < 14) {
    return {
      sessionType: 'lunch',
      startTime: '12:00',
      endTime: '14:00'
    };
  }

  // Dinner: 7:00 PM - 9:00 PM
  if (currentTime >= 19 && currentTime < 21) {
    return {
      sessionType: 'dinner',
      startTime: '19:00',
      endTime: '21:00'
    };
  }

  // No active meal session
  return null;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Check if the current time is within a given meal session
 * @param {string} sessionType - 'breakfast' | 'lunch' | 'dinner'
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
