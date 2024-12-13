import mongoose from "mongoose";
import bcryptjs from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import crypto from 'crypto'
 
const AdminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [ true, 'First name is required.']
    },
    lastName: {
        type: String,
        required: [ true, 'Last name is required.']
    },
    email: {
        type: String,
        required: [ true, 'Email Address is required.' ],
        unique: [ true, 'Email already exist' ]
    },
    password: {
        type: String,
        required: [ true, 'Password is required.']
    },
    phoneNumber: {
        type: String,
        //required: [ true, 'Phone number is required']
    },
    country: {
        type: String,
        //required: [ true, 'Country is required']
    },
    bio: {
        type: String,
    },
    role: {
        type: String,
        required: [ true, 'An Admin role is required'],
        default: 'Staff',
        enum: ['Staff', 'Manager', 'Admin']
    },
    profileImg: {
        type: String,
    },
    staffID: {
        type: String,
        unique: [ true, 'Staff ID already exist' ],
        required: [ true, 'Staff ID is required']
    },
    blocked: {
        type: Boolean,
        default: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    accountType: {
        type: String,
        default: 'admin'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
    { timestamps: true }
)

AdminSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        return next();
    }

    try {
        const salt = await bcryptjs.genSalt(10)
        this.password = await bcryptjs.hash(this.password, salt)
        next()
    } catch (error) {
        console.log('UNABLE TO HASH ADMIN PASSWORD', error)
        next(error)
    }
})

AdminSchema.methods.matchAdminPassword = async function(password) {
    return await bcryptjs.compare(password, this.password)
}

AdminSchema.methods.getAccessToken = function(){
    return jsonwebtoken.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRE})
}

AdminSchema.methods.getRefreshToken = function(){
    return jsonwebtoken.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE})
}

AdminSchema.methods.getAdminResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordExpire = Date.now() + 10 * ( 60 * 1000 )

    return resetToken
}

const AdminModel = mongoose.model('admin', AdminSchema)
export default AdminModel