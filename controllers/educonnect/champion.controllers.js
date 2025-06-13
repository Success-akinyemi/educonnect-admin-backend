import { generateUniqueCode } from "../../middlewares/utils.js"
import ChampionModel from "../../models/educonnect/Champion.js"

//become a member
export async function becomeAChampion(req, res) {
    const { firstName, lastName, email, phoneNumber, reasonToBecomeAChampion, currentProject, pastProject, isCommitted } = req.body
    if(!firstName) return res.status(400).json({ success: false, data: 'First name is required' })
    if(!lastName) return res.status(400).json({ success: false, data: 'Last name is required' })
    if(!email) return res.status(400).json({ success: false, data: 'Email is required' })
    if(!phoneNumber) return res.status(400).json({ success: false, data: 'Phone number is required' })
    if(!reasonToBecomeAChampion) return res.status(400).json({ success: false, data: 'Provide a reason to become a champion' })
    if(!currentProject) return res.status(400).json({ success: false, data: 'Provide a current project you are working on' })
    if(!pastProject) return res.status(400).json({ success: false, data: 'Provide a past project you\'ve worked on' })
    if(!isCommitted) return res.status(400).json({ success: false, data: 'Please agree to be committied representing EduConnect Africa positively and responsibly.' })

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(401).json({ success: false, data: 'Invalid Email Address' });
    }
    try {
        //email exist
        const existingChampionEmail = await ChampionModel.findOne({ email})
        if (existingChampionEmail) {
            return res.status(400).json({ success: false, data: 'Email already exists' });
        }

        const championId = await generateUniqueCode(8)
        console.log('CHAMPION ID', championId)

        const newChampion = await ChampionModel.create({
            championId,
            firstName,
            lastName,
            email,
            phoneNumber,
            reasonToBecomeAChampion,
            currentProject,
            pastProject,
            isCommitted,
        });

        res.status(201).json({ success: true, data: 'Champion form submitted successfully' });
    } catch (error) {
        console.log('UNABLE TO SUBMIT CHAMPION FORM', error)
        return res.status(500).json({ success: false, data: 'Unable to submit champion form' })
    }
}

//get all members
export async function getAllChampion(req, res) {
    const { accepted } = req.query

    try {
        let champions;
        if (accepted === 'true') {
            champions = await ChampionModel.find({ accepted: true }).sort({ createdAt: -1 });
        } else if (accepted === 'false') {
            champions = await ChampionModel.find({ accepted: false }).sort({ createdAt: -1 });
        } else {
            champions = await ChampionModel.find().sort({ createdAt: -1 });
        }

        if (!champions || champions.length === 0) {
            return res.status(404).json({ success: false, data: 'No champions found' });
        }

        return res.status(200).json({ success: true, data: champions });
    } catch (error) {
        console.log('UNABLE TO GET ALL CHAMPION', error)
        return res.status(500).json({ success: false, data: 'Unable to get all champions' });
    }
}

//get a member 
export async function getAChapion(req, res) {
    const { id } = req.params
    if(!id) return res.status(400).json({ success: false, data: 'Champion ID is required' })

    try {
        const champion = await ChampionModel.findOne({ championId: id }).select('-_id -__V');
        if (!champion) {
            return res.status(404).json({ success: false, data: 'Champion not found' });
        }

        return res.status(200).json({ success: true, data: champion });
    } catch (error) {
        console.log('UNABLE TO GET CHAMPION', error)
        return res.status(500).json({ success: false, data: 'Unable to get champion' });
    }
}

//accept or reject a champion
export async function acceptOrRejectChampion(req, res) {
    const { id } = req.body
    if(!id) return res.status(400).json({ success: false, data: 'Champion ID is required' })

    try {
        const champion = await ChampionModel.findOne({ championId: id })
        if(!champion){
            return res.status(404).json({ success: false, data: 'Champion not found' })
        }

        champion.accepted = !champion.accepted
        await champion.save()

        res.status(200).json({ success: true, data: 'Champion status updated successfully' })
    } catch (error) {
        console.log('UNABLE TO UPDATE CHAMPION STATUS', error)
        return res.status(500).json({ success: false, data: 'Unable to update champion status' });
    }
}