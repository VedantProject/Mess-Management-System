export const staffOnly = (req, res, next) => {
  if (req.user?.role !== 'Staff') {
    return res.status(403).json({message: 'Staff access only'});
  }
  next();
};
