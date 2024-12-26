import { generateUniqueCode } from "../middlewares/utils.js"
import NewsLetterModel from "../models/NewsLetter.js"
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const newNewsletter = async (req, res) => {
    const { title, message, website, author, caption, url, image } = req.body;

    if (!title || !message || !website) {
        return res.status(400).json({ success: false, data: "Title, Message, and Website fields are required." });
    }

    try {
        const newsLetterId = await generateUniqueCode(8);
        let imageUrl = null;
        if (req.files?.image?.[0]) {
            const file = req.files.image[0];

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "team_images" },
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

        const newNewsletterData = await NewsLetterModel.create({
            title, message, website, newsLetterId, author, caption, url, image: imageUrl
        });

        console.log('MEMEM', newNewsletterData)

        res.status(201).json({ success: true, data: "New news letter created successfully." });
    } catch (error) {
        console.error("Error creating new newsletter:", error);
        res.status(500).json({ success: false, data: "Unable to create new newsletter." });
    }
};


export async function editNewsLetter(req, res) {
    const { id, title, message, website, author, caption, url, image } = req.body;

    try {
        const getNewsLetter = await NewsLetterModel.findOne({ newsLetterId: id })
        if(!getNewsLetter){
            return res.status(404).json({ success: false, data: 'News Letter not found' })
        }

        let imageUrl = null;

        if (req.files?.image?.[0]) {
            const file = req.files.image[0];

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "team_images" },
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
        const updateNewsletter= await NewsLetterModel.findByIdAndUpdate(
            getNewsLetter?._id,
            {
                $set: {
                    title, 
                    message, 
                    website, 
                    author, 
                    caption, 
                    url, 
                    image
                }
            },
            { new: true}
        )
        console.log('News Letter Updated', updateNewsletter)
        res.status(201).json({ success: true, data: 'News letter updated' })
    } catch (error) {
        console.log('UNABLE TO UPDATE TEAM MEMBER', error)
        res.status(500).json({ success: false, data: 'Unable to update team member' })
    }
}

export async function getNewsLetter(req, res) {
    try {
        const getAllNewsLetter = await NewsLetterModel.find()

        res.status(200).json({ success: true, data: getAllNewsLetter })
    } catch (error) {
        console.log('UNABLE TO GET ALL NEWSLETTER', error)
        res.status(500).json({ success: false, data: 'Unable to get all newsLetter' }) 
    }
}

export async function getANewsLetter(req, res) {
    const { id } = req.params
    try {
        const getNewsLetter = await NewsLetterModel.findOne({ newsLetterId: id })
        if(!getNewsLetter){
            return res.status(404).json({ success: false, data: 'News letter not found' })
        }

        res.status(200).json({ success: true, data: getNewsLetter })
    } catch (error) {
        console.log('UNABLE TO GET TEAM MEMBER', error)
        res.status(500).json({ success: false, data: 'Unable to get team member' })
    }
}

export async function deleteNewsLetter(req, res) {
    const { id } = req.body
    try {
        const getNewsLetter = await NewsLetterModel.findOne({ newsLetterId: id })
        if(!getNewsLetter){
            return res.status(404).json({ success: false, data: 'Newsletter not found' })
        }

        const deleteNewsLetterData = await NewsLetterModel.findOneAndDelete({ newsLetterId: id })

        res.status(200).json({ success: true, data: 'News letter deleted succesful' })
    } catch (error) {
        console.log('UNABLE TO DELETE NEWS LETTER', error)
        res.status(500).json({ success: false, data: 'Unable to delete news letter' })
    }
}