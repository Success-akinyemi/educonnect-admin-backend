import mongoose from "mongoose";

const NewsLetterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [ true, 'Title message is required' ]
    },
    message: {
        type: String,
        required: [ true, 'NewsLetter message is required' ]
    },
    website: {
        type: String,
        required: [ true, 'Website message is required' ]
    },
    newsLetterId: {
        type: String,
        required: [ true, 'News Letter Id message is required' ]
    },
    active: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'Publish'
    },
    author: {
        type: String
    },
    caption: {
        type: String
    },
    url: {
        type: String
    },
    image: {
        type: String
    }
},
{ timestamps: true }
)

const NewsLetterModel = mongoose.model('newsLetter', NewsLetterSchema)
export default NewsLetterModel