import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    email:    { type: String, required: true, unique: true },
    otp:      { type: String, required: true },
    name:     { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 },
})

const otpModel = mongoose.models.otp || mongoose.model('otp', otpSchema)

export default otpModel
