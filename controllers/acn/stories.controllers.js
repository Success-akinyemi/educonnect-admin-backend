import mongoose from "mongoose";
import { generateUniqueCode } from "../../middlewares/utils.js"
import StoriesModel from "../../models/acn/Stroies.js"
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function convertCategoryToArray(categoryString) {
    return categoryString.split(',').map(category => category.trim());
  }

export async function newStory(req, res) {
    const { title, story, category, image, writers, caption } = req.body
    const { email, staffID } = req.user
    if(!title){
        return res.status(404).json({ success: false, data: 'Provide a title' })
    }
    if(!story){
        return res.status(404).json({ success: false, data: 'Provide a story' })
    }
    if(!category || category?.lenght < 1 ){
        return res.status(404).json({ success: false, data: 'Provide a category' })
    }
    if(!writers){
        return res.status(404).json({ success: false, data: 'Provide writer name' })
    }
    try {
        const newStoryId = await generateUniqueCode(8)
        console.log('STORY ID>>', `${newStoryId}`)

        const categoryArray = convertCategoryToArray(category);
        let imageUrl = null;

        if (req.files?.image?.[0]) {
            const file = req.files.image[0];

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "story_images" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(file.buffer); // Use the file buffer from Multer
            });

            imageUrl = uploadResult.secure_url;
            console.log("Uploaded image URL:", imageUrl);
        }

        const newPostData = await StoriesModel.create({
            title, story, storyId: newStoryId, caption, category: categoryArray, image: imageUrl, writers, writerEmail: email, writerId: staffID
        })

        res.status(201).json({ success: true, data: 'New Story created successful' })
    } catch (error) {
        console.log('UNABLE TO CREATE A NEW NEWS POST', error)
        res.status(500).json({ success: false, data: 'Unable to create new news post' })
    }
}

export async function updateStory(req, res) {
    const { id, title, story, category, caption, image, writers } = req.body
    try {
        const findPost = await StoriesModel.findById({ _id: id })
        if(!findPost){
            return res.status(404).json({ success: false, data: 'Story with this id deos not exist' })
        }

        let imageUrl = null;

        if (req.files?.image?.[0]) {
            const file = req.files.image[0];

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "story_images" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(file.buffer); // Use the file buffer from Multer
            });

            imageUrl = uploadResult.secure_url;
            console.log("Uploaded image URL:", imageUrl);
        }
        const updatePost = await StoriesModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    story,
                    category,
                    image: imageUrl,
                    writers,
                    caption
                }
            },
            { new: true }
        )

        res.status(201).json({ success: true, data: 'Updated successfull' })
    } catch (error) {
        console.log('UNABLE TO UPDATE NEWS POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to update news posts' })
    }
}

export async function deleteStory(req, res) {
    const { id } = req.body
    try {
        const findPost = await StoriesModel.findById({ _id: id })
        if(!findPost){
            return res.status(404).json({ success: false, data: 'Story with this id deos not exist' })
        }

        const deletePost = await StoriesModel.findByIdAndDelete({ _id: id })

        res.status(200).json({ success: true, data: 'Story Deleted successful' })
    } catch (error) {
        console.log('UNABLE TO DELETE NEWS POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to delete news post' })
    }
}

export async function toggleActive(req, res) {
    const { id } = req.body
    try {
        const findPost = await StoriesModel.findById({ _id: id })
        if(!findPost){
            return res.status(404).json({ success: false, data: 'Story with this id deos not exist' })
        }

        findPost.active = !findPost.active
        await findPost.save()
        res.status(200).json({ success: true, data: `${findPost?.active ? 'Story Active' : 'Story Inactive'}` })
    } catch (error) {
        console.log('UNABLE TO DELETE NEWS POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to delete news post' })
    }
}

export async function getAllStories(req, res) {
    try {
        const getPosts = await StoriesModel.find()

        res.status(200).json({ success: false, data: getPosts })
    } catch (error) {
        console.log('UNABLE TO GET ALL POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to get all posts' })
    }
}

export async function getAStory(req, res) {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, data: 'Invalid ID format' });
    }

    try {
        const findPost = await StoriesModel.findById(id);

        if (!findPost) {
            return res.status(404).json({ success: false, data: 'Story with this ID does not exist' });
        }

        res.status(200).json({ success: true, data: findPost });
    } catch (error) {
        console.error('UNABLE TO GET POST', error);
        res.status(500).json({ success: false, data: 'Unable to get post' });
    }
}
//USERS
export async function getUserAllStories(req, res) {
    try {
        const getPosts = await StoriesModel.find({ active: true })

        res.status(200).json({ success: false, data: getPosts })
    } catch (error) {
        console.log('UNABLE TO GET ALL POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to get all posts' })
    }
}

export async function getUserAStory(req, res) {
    const { id } = req.params
    try {
        const findPost = await StoriesModel.findById({ _id: id })
        if(!findPost){
            return res.status(404).json({ success: false, data: 'Story with this id deos not exist' })
        }

        if(findPost?.active == false || findPost?.blocked == true ){
            return res.status(403).json({ success: false, data: 'Not Allowed' })
        }

        res.status(200).json({ success: true, data: findPost })
    } catch (error) {
        console.log('UNABLE TO GET POST', error)
        res.status(500).json({ success: false, data: 'Unable to get post' })
    }
}
