import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) =>
    jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1h'});

// Register
router.post('/register', async (req, res) => {
  const {name, email, password, role} = req.body;
  const existing = await User.findOne({email});
  if (existing) return res.status(400).json({message: 'User exists'});

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({name, email, password: hashed, role});
  res.json({token: generateToken(user._id)});
});

// Login
router.post('/login', async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({token: generateToken(user._id), role: user.role});
  } else {
    res.status(401).json({message: 'Invalid credentials'});
  }
});

export default router;
