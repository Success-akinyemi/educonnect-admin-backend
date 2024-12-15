import mongoose from "mongoose";

const TestimomialsSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    position: {
        type: String,
        required: [true, 'Position is required']
    },
    userId: {
        type: String,
        required: [true, 'Id is required']
    },
    testimony: {
        type: String,
        required: [true, 'Testimony is required']
    },
    img: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    },
    blocked: {
        type: Boolean,
        default: false
    },
    website: {
        type: String,
        required: [ true, 'Website base is required'],
        //enum: [ 'educonnect', 'acn', 'arewahub' ]
    }
},
{ timestamps: true }
)

const TestimomialsModel = mongoose.model('testimonials', TestimomialsSchema)
export default TestimomialsModel