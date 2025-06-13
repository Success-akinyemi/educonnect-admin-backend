import { generateUniqueCode } from "../../middlewares/utils.js"
import VolunteerModel from "../../models/educonnect/Volunteer.js"

//become a volunteer
export async function becomeAVolunteer(req, res) {
    const { firstName, lastName, email, phoneNumber, skill, message } = req.body
    if(!firstName) return res.status(400).json({ success: false, data: 'First name is required' })
    if(!lastName) return res.status(400).json({ success: false, data: 'Last name is required' })
    if(!email) return res.status(400).json({ success: false, data: 'Email is required' })
    if(!phoneNumber) return res.status(400).json({ success: false, data: 'Phone number is required' })

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(401).json({ success: false, data: 'Invalid Email Address' });
    }
    try {
        //email exist
        const existingVolunteer = await VolunteerModel.findOne({ email})
        if (existingVolunteer) {
            return res.status(400).json({ success: false, data: 'Email already exists' });
        }

        const volunteerId = await generateUniqueCode(8)
        console.log('VOLUNTEER ID', volunteerId)

        const newVolunteer = await VolunteerModel.create({
            volunteerId,
            firstName,
            lastName,
            email,
            phoneNumber,
            skill,
            message
        });

        res.status(201).json({ success: true, data: 'Volunteer form submitted successfully' });
    } catch (error) {
        console.log('UNABLE TO BECOME A VOLUNTEER', error)
        return res.status(500).json({ success: false, data: 'Unable to submit volunteer form' })
    }
}

//get all volunteers
export async function getAllVolunteers(req, res) {
    const { accepted } = req.query

    try {
        let volunteers;
        if (accepted === 'true') {
            volunteers = await VolunteerModel.find({ accepted: true }).sort({ createdAt: -1 });
        } else if (accepted === 'false') {
            volunteers = await VolunteerModel.find({ accepted: false }).sort({ createdAt: -1 });
        } else {
            volunteers = await VolunteerModel.find().sort({ createdAt: -1 });
        }

        if (!volunteers || volunteers.length === 0) {
            return res.status(404).json({ success: false, data: 'No volunteers found' });
        }

        return res.status(200).json({ success: true, data: volunteers });
    } catch (error) {
        console.log('UNABLE TO GET ALL VOLUNTEERS', error)
        return res.status(500).json({ success: false, data: 'Unable to get all volunteers' });
    }
}

//get a voluteer 
export async function getAVolunteer(req, res) {
    const { id } = req.params
    if(!id) return res.status(400).json({ success: false, data: 'Volunteer ID is required' })

    try {
        const volunteer = await VolunteerModel.findOne({ volunteerId: id });
        if (!volunteer) {
            return res.status(404).json({ success: false, data: 'Volunteer not found' });
        }

        return res.status(200).json({ success: true, data: volunteer });
    } catch (error) {
        console.log('UNABLE TO GET VOLUNTEER', error)
        return res.status(500).json({ success: false, data: 'Unable to get volunteer' });
    }
}

//accept or reject a volunteer
export async function acceptOrRejectVolunteers(req, res) {
    const { id } = req.body
    if(!id) return res.status(400).json({ success: false, data: 'Volunteer ID is required' })

    try {
        const volunteer = await VolunteerModel.findOne({ volunteerId: id })
        if(!volunteer){
            return res.status(404).json({ success: false, data: 'Volunteer not found' })
        }

        volunteer.accepted = !volunteer.accepted
        await volunteer.save()

        res.status(200).json({ success: true, data: 'Volunteer status updated successfully' })
    } catch (error) {
        console.log('UNABLE TO UPDATE VOLUNTEER STATUS', error)
        return res.status(500).json({ success: false, data: 'Unable to update volunteer status' });
    }
}
