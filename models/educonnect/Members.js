import mongoose from "mongoose";

const MembersSchema = new mongoose.Schema({
    memberId: {
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

const MembersModel = mongoose.model('educonnectmember', MembersSchema)
export default MembersModel