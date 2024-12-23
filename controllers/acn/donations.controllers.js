import { generateUniqueCode } from "../../middlewares/utils.js"
import DonationModel from "../../models/acn/Donations.js"

export async function newDonation(req, res) {
    const { firstName, lastName, email, phoneNumber, address, amount, } = req.body
    if(!firstName || !lastName || !email || !phoneNumber || !address || !amount){
        return res.status(400).json({ success: false, data: 'Fill all fields.' })
    }
    try {
        const donationId = await generateUniqueCode(8)
        console.log('DONATION ID', donationId)

        const newTeamMember = await DonationModel.create({
            firstName, lastName, email, phoneNumber, address, donationId, amount
        })
        
        res.status(210).json({ success: false, data: 'Donation created' })
    } catch (error) {
        console.log('UNABLE TO CREATE NEW DONATION', error)
        res.status(500).json({ success: false, data: 'Unable to create donation' })
    }
}

export async function getAllDonation(req, res) {
    try {
        const getAllDonbations = await DonationModel.find().select('-_id')

        res.status(200).json({ success: false, data: getAllDonbations })
    } catch (error) {
        console.log('UNABLE TO GET ALL DONATIONS', error)
        res.status(500).json({ success: false, data: 'Unable to get all donations' }) 
    }
}

export async function getDonation(req, res) {
    const { id } = req.params
    try {
        const getDonationData = await DonationModel.findOne({ donationId: id })
        if(!getDonationData){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        res.status(200).json({ success: true, data: getDonationData })
    } catch (error) {
        console.log('UNABLE TO GET DONATION', error)
        res.status(500).json({ success: false, data: 'Unable to get donation' })
    }
}

export async function toggleActiveStatus(req, res) {
    const { id } = req.params
    try {
        const getDonationData = await DonationModel.findOne({ teamMemberId: id })
        if(!getDonationData){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        getDonationData.status = !getDonationData.status
        await getDonationData.save()

        res.status(200).json({ success: true, data: 'Donation active status updated' })
    } catch (error) {
        console.log('UNABLE TO UPDATE DONATION STATUS', error)
        res.status(500).json({ success: false, data: 'Unable to donation status' })
    }
}

export async function deleteDonation(req, res) {
    const { id } = req.params
    try {
        const getDonationData = await DonationModel.findOne({ teamMemberId: id })
        if(!getDonationData){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        const deleteTeamMember = await DonationModel.findOneAndDelete({ teamMemberId: id })

        res.status(200).json({ success: true, data: 'Donation deleted succesful' })
    } catch (error) {
        console.log('UNABLE TO GET DELETE DONATIONS', error)
        res.status(500).json({ success: false, data: 'Unable to get delete donation' })
    }
}