import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: [ true, 'Event name is required']
    },
    location: {
        type: String
    },
    eventId: {
        type: String,
        required: [ true, 'Event Id is required' ],
        unique: [ true, 'Event Id must be unique' ]
    },
    speakers: {
        type: String,
    },
    schedule: {
        type: String
    },
    image: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
},
{timestamps: true}
)

const EventModel = mongoose.model('event', EventSchema)
export default EventModel