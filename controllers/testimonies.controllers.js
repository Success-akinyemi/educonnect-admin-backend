import { generateUniqueCode } from "../middlewares/utils.js"
import NotificationModel from "../models/NotificationModel.js"
import TestimomialsModel from "../models/Testimonials.js"

export async function newTestimonials(req, res) {
    const { firstName, lastName, position, testimony, img, website } = req.body
    if(!firstName){
        return res.status(400).json({ success: false, data: 'Provide First name' })
    }
    if(!lastName){
        return res.status(400).json({ success: false, data: 'Provide Last name' })
    }
    if(!position){
        return res.status(400).json({ success: false, data: 'Provide Testifier position' })
    }
    if(!testimony){
        return res.status(400).json({ success: false, data: 'Provide Testifier Testimony' })
    }
    if(!website){
        return res.status(400).json({ success: false, data: 'Provide Website for Testimony' })
    }
    try {
        const testimonyId = await generateUniqueCode(8)
        console.log('TESTIMONY ID>>', `${testimonyId}`)

        const newTestimony = await TestimomialsModel.create({
            firstName, lastName, position, testimony, img, userId: testimonyId, website
        })

        const newNotification = await NotificationModel.create({
            message: `${firstName} ${lastName} added a new testimony for ${website}`,
            actionBy: `${firstName} ${lastName}`,
            name: `${firstName} ${lastName}`
        });

        res.status(201).json({ success: true, data: 'Testimony Save Successful' })
    } catch (error) {
        console.log('UNABLE TO CREATE TESTIMONY', error)
        res.status(500).json({ success: false, data: 'Unable to create testimony' })
    }
}

export async function toggleBlacklist(req, res) {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ success: false, data: 'Provide an Id' })
    }
    try {
        const getTestimony = await TestimomialsModel.findById({ _id: id })
        if(!getTestimony){
            return res.status(404).json({ success: false, data: 'Testimony with this Id does not exist' })
        }

        getTestimony.blocked = !getTestimony.blocked
        await getTestimony.save()

        res.status(200).json({ success: true, data: `${getTestimony.blocked ? 'Testimony Blocked' : 'Testimony Unblocked'}` })
    } catch (error) {
        console.log('UNABLE TO TOGGLE BLACKLIST STATUS', error)
        res.status(500).json({ success: false, data: '' })
    }
}

export async function toggleApproveTestimony(req, res) {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ success: false, data: 'Provide an Id' })
    }
    try {
        const getTestimony = await TestimomialsModel.findById({ _id: id })
        if(!getTestimony){
            return res.status(404).json({ success: false, data: 'Testimony with this Id does not exist' })
        }

        getTestimony.active = !getTestimony.active
        await getTestimony.save()

        res.status(200).json({ success: true, data: `${getTestimony.active ? 'Testimony Is Active' : 'Testimony is deactived from live'}` })
    } catch (error) {
        console.log('UNABLE TO TOGGLE ACTIVE STATUS', error)
        res.status(500).json({ success: false, data: 'Unable to toggle active status on testimony' })
    }
}

export async function deleteTestimony(req, res) {
    const { id } = req.body
    const { _id, firstName, lastName } = req.user
    if(!id){
        return res.status(400).json({ success: false, data: 'Provide an Id' })
    }
    try {
        const getTestimony = await TestimomialsModel.findById({ _id: id })
        if(!getTestimony){
            return res.status(404).json({ success: false, data: 'Testimony with this Id does not exist' })
        }

        const deleteTestimony = await TestimomialsModel.findByIdAndDelete({ _id: id })

        const newNotification = await NotificationModel.create({
            message: `${firstName} ${lastName} deleted a testimony for ${getTestimony?.website}`,
            actionBy: `${firstName} ${lastName}`,
            name: `${firstName} ${lastName}`
        });

        res.status(200).json({ success: true, data: 'Testimony deleted' })
    } catch (error) {
        console.log('UNABLE TO DELETE TESTIMONY', error)
        res.status(500).json({ success: false, data: 'Unable to delete testimony' })
    }
}

export async function getAllTestimonies(req, res) {
    try {
        const allTestimonies = await TestimomialsModel.find().sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: allTestimonies })
    } catch (error) {
        console.log('UNABLE TO GET ALL TESTIMONIALS (EDUCONNECT)', error)
        res.status(500).json({ success: false, data: 'Unable to get all testimomials' })
    }
}

export async function getATestimonies(req, res) {
    const { id } = req.params
    if(!id){
        return res.status(400).json({ success: false, data: 'Provide Testimony ID' })
    }
    try {
        const getTestimony = await TestimomialsModel.findById({ _id: id })
        if(!getTestimony){
            return res.status(404).json({ success: false, data: 'Testimony with this id does not exist' })
        }

        res.status(200).json({ success: true, data: getTestimony })
    } catch (error) {
        console.log('UNABLE TO GET TESTIMONY', error)
        res.status(500).json({ success: false, data: 'Unable to get testimonies' })
    }
}

export async function getSectionTestimonies(req, res) {
    const { value } = req.params
    if(!value){
        return res.status(400).json({ success: false, data: 'Value parameter is required' })
    }
    try {
        const getData = await TestimomialsModel.find({ website: value }).sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: getData })
    } catch (error) {
        console.log(`UNABLE TO GET TESTIMONIES FOR ${value}`, error)
        res.status(500).json({ success: false, data: 'Unable to get testimony' })
    }
}

export async function getSectionActiveTestimonies(req, res) {
    const { value } = req.params
    if(!value){
        return res.status(400).json({ success: false, data: 'Value parameter is required' })
    }
    try {
        const getData = await TestimomialsModel.find({ website: value, active: true }).sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: getData })
    } catch (error) {
        console.log(`UNABLE TO GET TESTIMONIES FOR ${value}`, error)
        res.status(500).json({ success: false, data: 'Unable to get testimony' })
    }
}

export async function getActiveTestimonies(req, res) {

    try {
        const getData = await TestimomialsModel.find({ active: true }).sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: getData })
    } catch (error) {
        console.log(`UNABLE TO GET TESTIMONIES FOR`, error)
        res.status(500).json({ success: false, data: 'Unable to get testimony' })
    }
}

export async function dele(req, res) {
    try {
        const deleee = await TestimomialsModel.deleteMany()

        res.status(200).json({ success: false, data: deleee })

    } catch (error) {
        console.log('ERROR', error)
        res.status(500).json({ success: false, data: 'Unable to get delete' })
    }
}