import { generateUniqueCode } from "../../middlewares/utils.js"
import TeamModel from "../../models/acn/Team.js"

export async function newTeam(req, res) {
    const { firstName, lastName, position, image, email, linkedinHandle, twitterHandle, instagramHandle } = req.body
    if(!firstName || !lastName || !position){
        return res.status(400).json({ success: false, data: 'First name, last name and position feilds are required.' })
    }
    try {
        const teamID = await generateUniqueCode(8)
        console.log('TEAM ID', teamID)

        const newTeamMember = await TeamModel.create({
            firstName, lastName, position, image, teamMemberId: teamID, email, linkedinHandle, twitterHandle, instagramHandle })
        
        res.status(210).json({ success: true, data: 'New Team member created' })
    } catch (error) {
        console.log('UNABLE TO CREATE NEW TEAM MEMBER', error)
        res.status(500).json({ success: false, data: 'Unable to create new team member' })
    }
}

export async function editeam(req, res) {
    const { id, firstName, lastName, position, image } = req.body
    try {
        const getTeamMember = await TeamModel.findOne({ teamMemberId: id })
        if(!getTeamMember){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        const updateTeamMember = await TeamModel.findByIdAndUpdate(
            getTeamMember?._id,
            {
                $set: {
                    firstName,
                    lastName,
                    image,
                    position
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

export async function getAllTeam(req, res) {
    try {
        const getAllTeamMemebers = await TeamModel.find().select('-_id')

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