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
    linkedinHandle: {
        type: String
    },
    twitterHandle: {
        type: String
    },
    instagramHandle: {
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

const TeamModel = mongoose.model('acnteammember', TeamSchema)
export default TeamModel