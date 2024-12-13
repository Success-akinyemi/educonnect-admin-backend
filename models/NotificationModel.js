import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [ true, 'Notification message is required' ]
    },
    read: {
        type: Boolean,
        default: false
    },
    actionBy: {
        type: String,
    },
    name: {
        type: String
    }
},
{ timestamps: true }
)

const NotificationModel = mongoose.model('notification', NotificationSchema)
export default NotificationModel