import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
    volunteerId: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    skill: {
        type: String,
    },
    message: {
        type: String,
    },
    accepted: {
        type: Boolean,
        default: false,
    },
},
{ timestamps: true },
)

const VolunteerModel = mongoose.model('educonnectvolunteer', volunteerSchema)
export default VolunteerModel