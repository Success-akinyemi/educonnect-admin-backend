import { generateUniqueCode } from "../../middlewares/utils.js";
import TeamModel from "../../models/eduafrica/Team.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const newTeam = async (req, res) => {
    const { firstName, lastName, position, email, linkedinHandle, twitterHandle, instagramHandle } = req.body;

    if (!firstName || !lastName || !position) {
        return res.status(400).json({ success: false, data: "First name, last name, and position fields are required." });
    }
    try {
        const teamID = await generateUniqueCode(8);
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

        const newMember = await TeamModel.create({
            firstName,
            lastName,
            position,
            email,
            linkedinHandle,
            twitterHandle,
            instagramHandle,
            image: imageUrl,
            teamMemberId: teamID,
        });

        console.log('MEMEM', newMember)

        res.status(201).json({ success: true, data: "New team member created successfully." });
    } catch (error) {
        console.error("Error creating new team member:", error);
        res.status(500).json({ success: false, data: "Unable to create new team member." });
    }
};


export async function editeam(req, res) {
    const { id, firstName, lastName, position, linkedinHandle, twitterHandle, instagramHandle } = req.body
    try {
        const getTeamMember = await TeamModel.findOne({ teamMemberId: id })
        if(!getTeamMember){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
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



        const updateTeamMember = await TeamModel.findByIdAndUpdate(
            getTeamMember?._id,
            {
                $set: {
                    firstName,
                    lastName,
                    image: imageUrl,
                    position,
                    linkedinHandle, 
                    twitterHandle, 
                    instagramHandle
                }
            },
            { new: true}
        )

        res.status(201).json({ success: true, data: 'Team member updated' })
    } catch (error) {
        console.log('UNABLE TO UPDATE TEAM MEMBER', error)
        res.status(500).json({ success: false, data: 'Unable to update team member' })
    }
}

export async function getAdminAllTeam(req, res) {
    try {
        const getAllTeamMemebers = await TeamModel.find().select('-_id')

        res.status(200).json({ success: true, data: getAllTeamMemebers })
    } catch (error) {
        console.log('UNABLE TO GET ALL TEAM MEMBER', error)
        res.status(500).json({ success: false, data: 'Unable to get all team member' }) 
    }
}

export async function getAllTeam(req, res) {
    try {
        const getAllTeamMemebers = await TeamModel.find({ active: true }).select('-_id')

        res.status(200).json({ success: true, data: getAllTeamMemebers })
    } catch (error) {
        console.log('UNABLE TO GET ALL TEAM MEMBER', error)
        res.status(500).json({ success: false, data: 'Unable to get all team member' }) 
    }
}

export async function getTeam(req, res) {
    const { id } = req.params
    try {
        const getTeamMember = await TeamModel.findOne({ teamMemberId: id })
        if(!getTeamMember){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        res.status(200).json({ success: true, data: getTeamMember })
    } catch (error) {
        console.log('UNABLE TO GET TEAM MEMBER', error)
        res.status(500).json({ success: false, data: 'Unable to get team member' })
    }
}

export async function toggleActiveStatus(req, res) {
    const { id } = req.body
    try {
        const getTeamMember = await TeamModel.findOne({ teamMemberId: id })
        if(!getTeamMember){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        getTeamMember.active = !getTeamMember.active
        await getTeamMember.save()

        res.status(200).json({ success: true, data: 'Team member active statu updated' })
    } catch (error) {
        console.log('UNABLE TO UPDATE TEAM MEMBER ACTIVE STATUS', error)
        res.status(500).json({ success: false, data: 'Unable to update team member active status' })
    }
}

export async function deleteTeamMember(req, res) {
    const { id } = req.body
    try {
        const getTeamMember = await TeamModel.findOne({ teamMemberId: id })
        if(!getTeamMember){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        const deleteTeamMember = await TeamModel.findOneAndDelete({ teamMemberId: id })

        res.status(200).json({ success: true, data: 'Team member deleted succes ful' })
    } catch (error) {
        console.log('UNABLE TO GET DELETE MEMBER', error)
        res.status(500).json({ success: false, data: 'Unable to get delete member' })
    }
}