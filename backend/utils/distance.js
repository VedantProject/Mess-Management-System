const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if location is within allowed radius of mess center
 */
const isWithinMessRadius = (lat, lng) => {
  const messLat = parseFloat(process.env.MESS_CENTER_LAT);
  const messLng = parseFloat(process.env.MESS_CENTER_LNG);
  const maxRadius = parseFloat(process.env.MESS_RADIUS_METERS);

  const distance = calculateDistance(messLat, messLng, lat, lng);
  return distance <= maxRadius;
};

module.exports = {
  calculateDistance,
  isWithinMessRadius,
};
