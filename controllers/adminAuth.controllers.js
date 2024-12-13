import { sendEmail } from "../middlewares/sendEmail.js"
import { generateOtp, generateUniqueCode } from "../middlewares/utils.js"
import AdminModel from "../models/Admin.js"
import NotificationModel from "../models/NotificationModel.js"
import OtpModel from "../models/Otp.js"

//REGISTER
export async function register(req, res) {
    const { firstName, lastName, email, password } = req.body
    if(!firstName){
        return res.status(400).json({ success: false, data: 'Provide a first name' })
    }
    if(!lastName){
        return res.status(400).json({ success: false, data: 'Provide a last name' })
    }
    if(!email){
        return res.status(400).json({ success: false, data: 'Provide an email address' })
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
        return res.status(401).json({ success: false, data: 'Invalid Email Address' })
    }
    if(!password){
        return res.status(400).json({ success: false, data: 'Provide a password' })
    }
    if(password.length < 8 ){
        return res.status(400).json({ success: false, data: 'Password must be at least 8 characters long' })
    }
    const specialChars = /[!@#$%^&*()_+{}[\]\\|;:'",.<>?]/;
    if (!specialChars.test(password)) {
        return res.status(400).json({ success: false, data: 'Passwords must contain at least one special character' });
    }
    try {
        const emailExist = await AdminModel.findOne({ email })
        if(emailExist){
            return res.status(400).json({ success: false, data: 'Email already exist' })
        }

        const generatedAdminCode = await generateUniqueCode(6)
        console.log('STAFF CODE>>', `EC${generatedAdminCode}`)

        const newAdmin = await AdminModel.create({
            firstName, lastName, email, password, staffID: `EC${generatedAdminCode}`
        })

        const otpCode = await generateOtp(newAdmin._id, newAdmin?.accountType)
        console.log('OTP', otpCode)

        const newNotification = await NotificationModel.create({
            message: `New Admin user register`,
            actionBy: newAdmin._id,
            name: `${firstName} ${lastName}`
        })

        try {
            await sendEmail({
                username: `${newAdmin?.firstName} ${newAdmin?.lastName}`,
                userEmail: newAdmin.email,
                subject: 'EDUCONNECT AFRICA ACCOUNT CREATED SUCCESS',
                intro: 'Your EduConnect Africa admin account has been created successfull',
                instructions: `Verify your account email address with this OTP. OTP is valid for one (1) Hour.`,
                outro: `If you have further question contact Admin for support`,
                otp: otpCode,
                textName: 'OTP'
            });

            return res.status(200).json({ success: true, email, data: `${firstName} ${lastName} account has been successfully created` });
        } catch (error) {
            console.log('ERROR SENDING VERIFY OTP EMAIL', error);
        }

        res.status(201).json({ success: true, data: `${firstName} ${lastName} has been successfully created an account` })
    } catch (error) {
        console.log('UNABLE TO CREATE A NEW ADMIN USER ACCOUNT', error)
        res.status(500).json({ success: false, data: 'Unable to create account' })
    }
}

export async function resendOtp(req, res) {
    const { email } = req.body
    if(!email){
        return res.status(400).json({ success: false, data: 'Email Address is required'})
    }
    try {
        const getUser = await AdminModel.findOne({ email })
        if(!getUser){
            return res.status(404).json({ success: false, data: 'User with does not exist please sign up' })
        }
        const otpExist = await OtpModel.findOne({ userId: getUser._id })
        if(otpExist){
            const deleteOtp = await OtpModel.findByIdAndDelete({ _id: otpExist._id })
        }


        const otpCode = await generateOtp(getUser._id, getUser.accountType)
        console.log('OTP', otpCode)

        try {
            await sendEmail({
                username: `${getUser.name}`,
                userEmail: getUser.email,
                subject: 'New Account Created',
                intro: 'Verify your EduConnect account email address',
                instructions: `Account created Succesful. Enter Otp and verify your Email Address. Your OTP code is: ${otpCode}. Note Otp is Valid for One (1) Hour.`,
                outro: `If you did not Sign Up, please ignore this email and report.
                `,
                otp: otpCode,
            });

            return res.status(200).json({ success: true, email: email, data: `Otp code sent successfull to user email` });
        } catch (error) {
            console.log('ERROR SENDING VERIFY OTP EMAIL', error);
        }

        res.status(201).json({ success: true, data: 'Otp sent successful' })
        
    } catch (error) {
        console.log('UNABLE TO RESEND OTP', error)
        res.status(500).json({ success: false, data: 'Unable to resend OTP code' })
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    if(!email || !password){
        return res.json(400).status({ success: false, data: 'Email and Password is required.'})
    }
    try {
        const getUser = await AdminModel.findOne({ email });
        if (!getUser) {
            return res.status(404).json({ success: false, data: 'User with email does not exist' });
        }

        const isMatch = await getUser.matchAdminPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, data: 'Invalid credentials' });
        }

        if (!getUser.verified) {
            const otpExist = await OtpModel.findOne({ email });
            if (!otpExist) {
                const otpCode = await generateOtp(getUser._id, getUser.email);
                console.log('OTP', otpCode);

                try {
                    await sendEmail({
                        username: `${getUser.name}`,
                        userEmail: getUser.email,
                        subject: 'New Account Created',
                        intro: 'Verify your Apostolic App email address',
                        instructions: `Account created successfully. Your OTP code is: ${otpCode}. Note: OTP is valid for One (1) Hour.`,
                        outro: `If you did not sign up, please ignore this email and report.`,
                        otp: otpCode,
                    });

                    return res.status(200).json({
                        success: true,
                        email: getUser.email,
                        verified: false,
                        data: `Check OTP sent to ${getUser.email} to activate your account.`,
                    });
                } catch (error) {
                    console.log('ERROR SENDING VERIFY OTP EMAIL', error);
                }
            }
        }

        // Generate Tokens
        const accessToken = getUser.getAccessToken()
        const refreshToken = getUser.getRefreshToken()

        // Set cookies
        res.cookie('educonnectaccesstoken', accessToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('educonnecttoken', refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        const { password: hashedPassword, resetPasswordToken, resetPasswordExpire, ...userData } = getUser._doc;
        res.status(200).json({ success: true, verified: true, token: refreshToken, data: userData, msg: 'Login successful' });
    } catch (error) {
        console.log('UNABLE TO LOGIN USER', error);
        res.status(500).json({ success: false, data: 'Unable to login user' });
    }
}

//FORGOT PASSOWRD
export async function forgotPassword(req, res) {
    const { name } = req.body
    if(!name){
        return res.status(404).json({ success: false, data: 'Provide your registered email address or staff ID'})
    }
    try {
        const isEmail = name.includes('@');
        console.log('object', name, isEmail)

            const user = isEmail 
        ? await AdminModel.findOne({ email: name }) 
        : await AdminModel.findOne({ staffID: name });

        if(!user){
            return res.status(404).json({ success: false, data: 'Email Does Not Exist'})
        }

        const resetToken = user.getAdminResetPasswordToken()

        await user.save()
        const resetUrl = `${process.env.ADMIN_URL}/reset-password/${resetToken}`
        console.log('RESET TOKEN', resetUrl)

        try {
            // send mail
            const emailContent = {
                body: {
                    intro: 'You have Requested a password reset.',
                    action: {
                        instructions: 'Please click the following button to reset your password. Link Expires in 10 mintues',
                        button: {
                            color: '#00BF63',
                            text: 'Reset Your Password',
                            link: resetUrl
                        },
                    },
                    outro: `
                        Reset link: ${resetUrl}

                        If you did not request a password reset, please ignore this email and login to your account to change your password.
                    `
                },
            };

            const emailTemplate = mailGenerator.generate(emailContent)
            const emailText = mailGenerator.generatePlaintext(emailContent)

            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Password Reset Request',
                    text: emailTemplate
                })
                res.status(200).json({success: true, msg: 'Reset password link sent to email address', data: user?.user })
                
            } catch (error) {
                console.log('FORGOT PASSWORD EMAIL ERROR?>', error)
            }
            
        } catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined

            await user.save()
            console.log('Email could not be sent >>',error)
            return res.status(500).json({ success: false, data: 'Email could not be sent' })
        }

    } catch (error) {
        console.log('ERROR GENERATING ADMIN PASSWORD RESET LINK', error)
        res.status(500).json({ success: false, data: 'Something went wrong' })
    }
}

//RESET PASSWORD
export async function resetPassword(req, res) {
    const { password, confirmPassword } = req.body
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

    if (!password || !confirmPassword) {
        return res.status(400).json({ success: false, data: 'Password and confirm password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, data: 'Passwords must be at least 6 characters long' });
    }

    const specialChars = /[!@#$%^&*()_+{}[\]\\|;:'",.<>?]/;
    if (!specialChars.test(password)) {
        return res.status(400).json({ success: false, data: 'Passwords must contain at least one special character' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, data: 'Passwords do not match' });
    }

    try {

        const user = await AdminModel.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now()}
        })

        if(!user){
            return  res.status(400).json({ success: false, data: 'Invalid Reset Token'})
        }

        const isMatch = await user.matchAdminPassword(password);
        if(isMatch){
            return res.status(401).json({ success: false, data: 'Old Password must not match new password' })
        }

        user.password = password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined

        await user.save();

        res.status(201).json({
            success: true,
            data: 'Password Reset successful'
        })
        
    } catch (error) {
        console.log('ERROR RESETING ADMIN PASSWORD', error)
        res.status(500).json({ success: false, data: 'Something went wrong. Unable to process reset password request' })
    }
}

//UPDATE USER
export async function editProfile(req, res) {
    const { id, firstName, lastName, phoneNumber, country, profileImg, bio, email } = req.body
    try {
        if(req.body.staffID){
            return res.status(403).json({ success: false, data: 'Staff ID cannot be updated' })
        }
        const updateUser = await AdminModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    firstName,
                    lastName,
                    phoneNumber,
                    country,
                    profileImg,
                    bio,
                    email
                }
            },
            { new: true }
        )
        //console.log(updateUser)
        const { password, resetPasswordExpire, resetPasswordToken, _id, ...userData } = updateUser._doc
        res.status(200).json({ success: true, msg: 'Profile Updated Successful', data: userData })
    } catch (error) {
        console.log('UNABLE TO UPDATE ADMIN USER PROFILE', error)
        res.status(500).json({ success: false, data: 'Unable to update profile' })
    }
}

//UPDATE PASSWORD
export async function updatePassword(req, res){
    const { currentPassword, password, confirmPassword } = req.body
    if (password.length < 8) {
        return res.status(400).json({ success: false, data: 'Passwords must be at least 6 characters long' });
    }

    if(password !== confirmPassword){
        return res.status(400).json({ success: false, data: 'New password and confirm password do not match' })
    }

    const specialChars = /[!@#$%^&*()_+{}[\]\\|;:'",.<>?]/;
    if (!specialChars.test(password)) {
        return res.status(400).json({ success: false, data: 'Passwords must contain at least one special character' });
    }

    try {
        const getUser = await AdminModel.findById({ _id: req.admin._id })

        const isMatch = await getUser.matchAdminPassword(currentPassword);

        if(!isMatch){
            return res.status(401).json({ success: false, data: 'Invalid current password'})
        }

        if(currentPassword === password){
            return res.status(401).json({ success: false, data: 'New password cannot be the same with current password'})
        }

        getUser.password = password
        await getUser.save()

        res.status(201).json({ success: true, data: `Password Updated Successful` })
    } catch (error) {
        console.log('UNABEL TO UPDATE PASSWORD', error)
        res.status(500).json({ success: false, data: 'Unable to update password' })
    }
}

//GET ALL USER
export async function getAllAdmin(req, res) {
    try {
        const getAllUsers = await AdminModel.find()

        res.status(200).json({ success: false, data: getAllUsers })
    } catch (error) {
        console.log('UNABLE TO GET ALL ADMIN USER', error)
        res.status(500).json({ success: false, data: 'Unable to get all admin users' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie(`educonnectaccesstoken`)
        res.clearCookie('educonnecttoken').status(200).json({success: true, data: 'Signout success'})
    } catch (error) {
        console.log('UNABLE TO SIGNOUT USER', error)
        res.status(500).json({ success: false, data: '' })
    }
}


//APROVE ADMIN USER