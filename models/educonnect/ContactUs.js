import mongoose from "mongoose";

const ContactUsSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [ true, 'First name is required.' ]
    },
    lastName: {
        type: String,
        required: [ true, 'Last name is required.' ]
    },
    messageId: {
        type: String,
        required: [ true, 'Message Id is required.' ]
    },
    email: {
        type: String,
        required: [ true, 'Frist name is required.' ]
    },
    message: {
        type: String,
        required: [ true, 'Message is required.' ]
    },
    phoneNumber: {
        type: String,
        //required: [ true, 'Phone number is required.' ]
    },
    reply: {
        type: String
    }
},
 { timestamps: true }
)

const ContactUsModel = mongoose.model('educonnectcontactus', ContactUsSchema)
export default ContactUsModel