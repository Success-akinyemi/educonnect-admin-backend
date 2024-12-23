import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type: String
    },
    country: {
        type: String
    },
    amount: {
        type: Number
    },
    status: {
        type: Boolean,
        default: false
    },
    donationId: {
        type: String
    }
},
{ timestamps: true} 
)

const DonationModel = mongoose.model('acndonation', DonationSchema)
export default DonationModel