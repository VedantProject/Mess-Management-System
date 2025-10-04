import User from '../models/User.js'
export const registerUser = async (req, res) => {
  try {
    const {name, email, password, role} = req.body;
    const exuser = await User.findOne({email});
    if (exuser) {
      return res.status(400).json({message: 'User already exists.'})
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({name, email, password: hash, role});
    await user.save();
    res.status(201).json({message: 'User created successfully'});
  } catch (err) {
    res.status(400).json({error: err.message});
  }
};
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({});
    return res.json(users);
  } catch (error) {
    return res.status(400).json({error: err.message});
  }
}