const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const otpsSchema = new mongoose.Schema({
    otp: {
        type: String,
        minLength: 6,
        maxLength: 6,
        required: true
    }, mobile : {
        type: String,
        minLength: 10,
        maxLength: 10,
        required: true
    }, otpCreatedAt: { 
        type: Date, 
        default: Date.now,
        expires: process.env.OTP_EXPIRES_IN_SECS
    }
});

// pre/post
otpsSchema.pre("save", async function (next) {
    const otp = this;
    otp.otp = await bcrypt.hash(otp.otp, 8);
    next();
});

const OTPs = mongoose.model("OTPs", otpsSchema);

module.exports = OTPs;
