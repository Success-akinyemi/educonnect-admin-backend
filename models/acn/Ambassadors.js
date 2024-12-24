import mongoose from "mongoose";

const AmbassadorSchema = new mongoose.Schema({ 
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

const AmbassadorModel = mongoose.model('acnambassadors', AmbassadorSchema)
export default AmbassadorModel