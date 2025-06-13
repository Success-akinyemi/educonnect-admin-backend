import mongoose from "mongoose";

const ChampionSchema = new mongoose.Schema({
    championId: {
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
    reasonToBecomeAChampion: {
        type: String,
    },
    currentProject: {
        type: String,
    },
    pastProject: {
        type: String,
    },
    contribution: {
        type: String,
    },
    portfolioLink: {
        type: String,
    },
    isCommitted: {
        type: Boolean,
        default: false,
    },

    accepted: {
        type: Boolean,
        default: false,
    },
},
{ timestamps: true },
)

const ChampionModel = mongoose.model('educonnectchampion', ChampionSchema)
export default ChampionModel