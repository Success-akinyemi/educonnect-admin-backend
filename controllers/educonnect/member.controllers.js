import { generateUniqueCode } from "../../middlewares/utils.js"
import MembersModel from "../../models/educonnect/Members.js"

//become a member
export async function becomeAVolunteer(req, res) {
    const { firstName, lastName, email, phoneNumber, message } = req.body
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
        const existingMember = await MembersModel.findOne({ email})
        if (existingMember) {
            return res.status(400).json({ success: false, data: 'Email already exists' });
        }

        const memberId = await generateUniqueCode(8)
        console.log('MEMEBER ID', memberId)

        const newMember = await MembersModel.create({
            memberId,
            firstName,
            lastName,
            email,
            phoneNumber,
            message
        });

        res.status(201).json({ success: true, data: 'Memeber form submitted successfully' });
    } catch (error) {
        console.log('UNABLE TO BECOME A MEMBER', error)
        return res.status(500).json({ success: false, data: 'Unable to submit membership form' })
    }
}

//get all members
export async function getAllMembers(req, res) {
    const { accepted } = req.query

    try {
        let members;
        if (accepted === 'true') {
            members = await MembersModel.find({ accepted: true }).sort({ createdAt: -1 });
        } else if (accepted === 'false') {
            members = await MembersModel.find({ accepted: false }).sort({ createdAt: -1 });
        } else {
            members = await MembersModel.find().sort({ createdAt: -1 });
        }

        if (!members || members.length === 0) {
            return res.status(404).json({ success: false, data: 'No members found' });
        }

        return res.status(200).json({ success: true, data: members });
    } catch (error) {
        console.log('UNABLE TO GET ALL MEMBERS', error)
        return res.status(500).json({ success: false, data: 'Unable to get all members' });
    }
}

//get a member 
export async function getAMember(req, res) {
    const { id } = req.params
    if(!id) return res.status(400).json({ success: false, data: 'Member ID is required' })

    try {
        const member = await MembersModel.findOne({ memberId: id }).select('-_id -__V');
        if (!member) {
            return res.status(404).json({ success: false, data: 'Member not found' });
        }

        return res.status(200).json({ success: true, data: member });
    } catch (error) {
        console.log('UNABLE TO GET MEMBER', error)
        return res.status(500).json({ success: false, data: 'Unable to get member' });
    }
}

//accept or reject a members
export async function acceptOrRejectMembers(req, res) {
    const { id } = req.body
    if(!id) return res.status(400).json({ success: false, data: 'Member ID is required' })

    try {
        const member = await MembersModel.findOne({ memberId: id })
        if(!member){
            return res.status(404).json({ success: false, data: 'Member not found' })
        }

        member.accepted = !member.accepted
        await member.save()

        res.status(200).json({ success: true, data: 'Members status updated successfully' })
    } catch (error) {
        console.log('UNABLE TO UPDATE MEMBER STATUS', error)
        return res.status(500).json({ success: false, data: 'Unable to update member status' });
    }
}