import mongoose from "mongoose";

const ArewaHubMemberSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    location: {
        type: String
    },
    bussinessName: {
        type: String
    },
    craftType: {
        type: String
    },
    experienceLevel: {
        type: String
    },
    certificateImage: {
        type: String
    },
    artWorkGallery: {
        type: Array
    }
},
{ timestamps: true }
)

const ArewaHubMemberModel = mongoose.model('arewahubmember', ArewaHubMemberSchema)
export default ArewaHubMemberModel