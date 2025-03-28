import mongoose from "mongoose";

const NewsAndUpdatesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [ true, 'Title is required' ]
    },
    post: {
        type: String,
        required: [ true, 'Post is required' ]
    },
    postId: {
        type: String,
        required: [ true, 'Post Id is required']
    },
    category: {
        type: Array
    },
    caption: {
        type: String
    },
    image: {
        type: String
    },
    writers: {
        type: String,
        required: [true, 'Writer(s) is required']
    },
    writerEmail: {
        type: String,
        required: [ true, 'Provide writer Email']
    },
    writerId: {
        type: String
    },
    writerImage: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    blocked: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
)

const NewsAndUpdatesModel = mongoose.model('newsAndUpdates', NewsAndUpdatesSchema)
export default NewsAndUpdatesModel