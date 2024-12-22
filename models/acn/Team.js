import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({ 
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    position: {
        type: String
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    image: {
        type: String,
    },
    teamMemberId: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
},
{ timestamps: true }
)

const TeamModel = mongoose.model('arewateammember', TeamSchema)
export default TeamModel