import mongoose from "mongoose";
import { generateUniqueCode } from "../../middlewares/utils.js"
import NewsAndUpdatesModel from "../../models/acn/NewsAndUpdates.js"
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });


function convertCategoryToArray(categoryString) {
    return categoryString.split(',').map(category => category.trim());
  }

export async function newNews(req, res) {
    const { title, post, category, image, writers } = req.body
    const { email, staffID } = req.user
    if(!title){
        return res.status(404).json({ success: false, data: 'Provide a title' })
    }
    if(!post){
        return res.status(404).json({ success: false, data: 'Provide a post' })
    }
    if(!category || category?.lenght < 1 ){
        return res.status(404).json({ success: false, data: 'Provide a category' })
    }
    if(!writers){
        return res.status(404).json({ success: false, data: 'Provide writer name' })
    }
    try {
        const newPostId = await generateUniqueCode(8)
        console.log('POST ID>>', `${newPostId}`)

        const categoryArray = convertCategoryToArray(category);

        let imageUrl
        if(image){
            const result = await cloudinary.uploader.upload(image)

            imageUrl = result.url
        }

        const newPostData = await NewsAndUpdatesModel.create({
            title, post, postId: newPostId, category: categoryArray, image: imageUrl, writers, writerEmail: email, writerId: staffID
        })

        res.status(201).json({ success: true, data: 'New Post created successful' })
    } catch (error) {
        console.log('UNABLE TO CREATE A NEW NEWS POST', error)
        res.status(500).json({ success: false, data: 'Unable to create new news post' })
    }
}

export async function updateNews(req, res) {
    const { id, title, post, category, image, writers } = req.body
    try {
        const findPost = await NewsAndUpdatesModel.findById({ _id: id })
        if(!findPost){
            return res.status(404).json({ success: false, data: 'Post with this id deos not exist' })
        }

        let imageUrl
        if(image){
            const result = await cloudinary.uploader.upload(image)

            imageUrl = result.url
        }

        const updatePost = await NewsAndUpdatesModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    post,
                    category,
                    image: imageUrl,
                    writers
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

export async function deleteNews(req, res) {
    const { id } = req.body
    try {
        const findPost = await NewsAndUpdatesModel.findById({ _id: id })
        if(!findPost){
            return res.status(404).json({ success: false, data: 'Post with this id deos not exist' })
        }

        const deletePost = await NewsAndUpdatesModel.findByIdAndDelete({ _id: id })

        res.status(200).json({ success: true, data: 'Post Deleted successful' })
    } catch (error) {
        console.log('UNABLE TO DELETE NEWS POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to delete news post' })
    }
}

export async function toggleActive(req, res) {
    const { id } = req.body
    try {
        const findPost = await NewsAndUpdatesModel.findById({ _id: id })
        if(!findPost){
            return res.status(404).json({ success: false, data: 'Post with this id deos not exist' })
        }

        findPost.active = !findPost.active
        await findPost.save()
        res.status(200).json({ success: true, data: `${findPost?.active ? 'Post Active' : 'Post Inactive'}` })
    } catch (error) {
        console.log('UNABLE TO DELETE NEWS POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to delete news post' })
    }
}

export async function getAllNewsAndUpdates(req, res) {
    try {
        const getPosts = await NewsAndUpdatesModel.find()

        res.status(200).json({ success: false, data: getPosts })
    } catch (error) {
        console.log('UNABLE TO GET ALL POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to get all posts' })
    }
}

export async function getANewsAndUpdates(req, res) {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, data: 'Invalid ID format' });
    }

    try {
        const findPost = await NewsAndUpdatesModel.findById(id);

        if (!findPost) {
            return res.status(404).json({ success: false, data: 'Post with this ID does not exist' });
        }

        res.status(200).json({ success: true, data: findPost });
    } catch (error) {
        console.error('UNABLE TO GET POST', error);
        res.status(500).json({ success: false, data: 'Unable to get post' });
    }
}
//USERS
export async function getUserAllNewsAndUpdates(req, res) {
    try {
        const getPosts = await NewsAndUpdatesModel.find({ active: true })

        res.status(200).json({ success: false, data: getPosts })
    } catch (error) {
        console.log('UNABLE TO GET ALL POSTS', error)
        res.status(500).json({ success: false, data: 'Unable to get all posts' })
    }
}

export async function getUserANewsAndUpdates(req, res) {
    const { id } = req.params
    try {
        const findPost = await NewsAndUpdatesModel.findById({ _id: id })
        if(!findPost){
            return res.status(404).json({ success: false, data: 'Post with this id deos not exist' })
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
