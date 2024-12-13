import AdminModel from "../models/Admin.js"
import OtpModel from "../models/Otp.js"

//VERIFY OTP
export async function verifyOtp(req, res) {
    const { otp } = req.body
    if(!otp){
        return res.status(400).json({ success: false, data: 'OTP is Required' })
    }
    try {
        const getOtp = await OtpModel.findOne({ code: otp })
        if(!getOtp){
            return res.status(404).json({ success: false, data: 'Invalid code' })
        }

        let getUser 
        if (getOtp.accountType === 'admin') {
            getUser = await AdminModel.findById({ _id: getOtp.userId });
        }
        getUser.verified = true
        await getUser.save()

        const deleteOtp = await OtpModel.findByIdAndDelete({ _id: getOtp._id })

        res.status(200).json({ success: true, data: 'Account Email Verified' })
    } catch (error) {
        console.log('UNABLE TO VERIFY OTP', error)
        res.status(500).json({ success: false, data: 'Unable to verify OTP' })
    }
}