import validator from "validator";
import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { sendOTPEmail } from "../utils/emailService.js";


const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET)

}
//Route for user login
const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User doesn't exists"})
        }
        const isMatch = await bcrypt.compare(password,user.password);

        if(isMatch){
            const token = createToken(user._id)
            res.json({success:true,token})
        }
        else{
            res.json({success:false,message:'Invalid credentials'})
        }
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})    
    }

}
//Route for user register
const registerUser = async (req,res) => {
    try {
        const {name,email,password} = req.body;
        //checking user already exists or not 
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:"User already exists"})
        }
        //validating email format n strong password
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Please enter a valid email"})

        }
        if (password.length < 8) {
            return res.json({success:false,message:"Please enter a strong password"})
        }
        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser = new userModel({
            name,
            email,
            password:hashedPassword
        })
        const user = await newUser.save()
        const token = createToken(user._id) 
        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
            
    }

}
//Route for admin login 
const adminLogin = async (req,res) => {
    try {
        const {email,password} = req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Invalid credentials"})
        }
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
    }

} 
const sendOtp = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Please enter a strong password' })
        }

        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: 'User already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        await otpModel.findOneAndUpdate(
            { email },
            { otp, name, password: hashedPassword, createdAt: new Date() },
            { upsert: true, new: true }
        )

        await sendOTPEmail(email, otp)

        res.json({ success: true, message: 'OTP sent to your email' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyOtpAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body

        const record = await otpModel.findOne({ email })
        if (!record) {
            return res.json({ success: false, message: 'OTP expired or not found. Please request a new one.' })
        }
        if (record.otp !== otp) {
            return res.json({ success: false, message: 'Incorrect OTP. Please try again.' })
        }

        const exists = await userModel.findOne({ email })
        if (exists) {
            await otpModel.deleteOne({ email })
            return res.json({ success: false, message: 'User already exists' })
        }

        const newUser = new userModel({
            name: record.name,
            email,
            password: record.password,
        })
        const user = await newUser.save()
        await otpModel.deleteOne({ email })

        const token = createToken(user._id)
        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { loginUser, registerUser, adminLogin, sendOtp, verifyOtpAndRegister }