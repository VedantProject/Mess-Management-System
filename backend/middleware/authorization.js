import User from '../models/User.js';
export const checkStaff = async (req, res, next) => {
  try {
    const {email} =
        req.body;
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    if (user.role !== 'Staff') {
      return res.status(403).json({message: 'Access denied: Staff only'});
    }
    next();
  } catch (err) {
    res.status(500).json({error: 'Server error'});
  }
};
