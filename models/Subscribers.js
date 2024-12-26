import mongoose from "mongoose";

const SuscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [ true, 'Please provide an email' ]
    },
    website: {
        type: String,
        required: [ true, 'Website base is required'],
        enum: [ 'educonnect', 'acn', 'arewahub', 'eduafrica' ]
    },
    siteName: {
        type: String
    }
})

const SuscriberModel = mongoose.model('suscriber', SuscriberSchema)
export default SuscriberModel