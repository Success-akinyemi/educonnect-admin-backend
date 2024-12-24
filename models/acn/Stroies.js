import mongoose from "mongoose";

const StoriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [ true, 'Title is required' ]
    },
    story: {
        type: String,
        required: [ true, 'Story is required' ]
    },
    storyId: {
        type: String,
        required: [ true, 'Story Id is required']
    },
    category: {
        type: Array
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
    active: {
        type: Boolean,
        default: true
    },
    caption: {
        type: String
    },
    blocked: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
)

const StoriesModel = mongoose.model('acnstories', StoriesSchema)
export default StoriesModel