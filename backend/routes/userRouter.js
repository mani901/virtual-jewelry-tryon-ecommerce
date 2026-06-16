import express from 'express';
import { loginUser, registerUser, adminLogin, sendOtp, verifyOtpAndRegister } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/send-otp', sendOtp)
userRouter.post('/verify-otp', verifyOtpAndRegister)

export default userRouter;