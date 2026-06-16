import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Zewar House" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Zewar House Verification Code',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fafafa;border:1px solid #e5e5e5">
                <h2 style="color:#1a1a1a;margin:0 0 8px">Zewar House</h2>
                <p style="color:#555;font-size:14px;margin:0 0 24px">Where every piece tells a story</p>
                <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 24px">
                <p style="color:#333;font-size:15px;margin:0 0 16px">Your one-time verification code is:</p>
                <div style="background:#1a1a1a;color:#fff;font-size:32px;font-weight:bold;letter-spacing:10px;text-align:center;padding:20px;border-radius:4px;margin:0 0 24px">
                    ${otp}
                </div>
                <p style="color:#777;font-size:13px;margin:0 0 8px">This code expires in <strong>10 minutes</strong>.</p>
                <p style="color:#777;font-size:13px;margin:0">If you did not request this, you can safely ignore this email.</p>
            </div>
        `,
    })
}
