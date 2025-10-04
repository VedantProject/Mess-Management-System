import express from 'express';
import User from '../models/User.js';
import bcrypt from "bcryptjs";
import { registerUser } from '../controller/Usercontroller.js';
import { checkStaff } from '../middleware/authorization.js';

//Registration of USer
const router = express.Router();
router.post('/register',registerUser);

//Getting all user for staff only
router.get('/',checkStaff,)

export default router;
