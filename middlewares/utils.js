import AdminModel from "../models/Admin.js";
import OtpModel from "../models/Otp.js";

export async function generateOtp(userId, accountType) {
    const generateOtp = () => {
        // Generate a random 6-digit number
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
        return otp;
    };

    let otp;
    let exists = true;

    while (exists) {
        otp = generateOtp();
        exists = await OtpModel.findOne({ code: otp });
    }

    const otpCode = await OtpModel.create({
        userId: userId,
        code: otp,
        accountType: accountType
    });

    console.log('NEW OTP MODEL', otpCode)

    return otp; 
}

export async function generateUniqueCode(length) {
    const courseSlug = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let slugCode = ''; 

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            slugCode += characters[randomIndex]; 
        }

        return slugCode;
    };

    let slugCode;
    let exists = true;

    while (exists) {
        slugCode = courseSlug();
        const existingCourse = await AdminModel.findOne({ slugCode: slugCode });
        exists = existingCourse !== null; 
    }

    return slugCode;
}
