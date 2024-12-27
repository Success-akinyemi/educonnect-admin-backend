import SuscriberModel from "../models/Subscribers.js"

export async function addSuscriber(req, res) {
    const { email, website } = req.body
    if(!email){
        return res.status(400).json({ success: false, data: 'Subscriber Email is required' })
    }
    if(!website){
        return res.status(400).json({ success: false, data: 'Website name is required' })
    }
    try {
        let siteName
        if(website == 'educonnect'){
            siteName = 'Edu Connect Africa'
        }
        if(website == 'eduafrica'){
            siteName = 'Edu Africa'
        }
        if(website == 'eduafricawaitlist'){
            siteName = 'Edu Africa Waitlist'
        }
        if(website == 'acn'){
            siteName = 'African Child Network'
        }
        if(website == 'arewahub'){
            siteName = 'Arewa Hub'
        }

        const emailSubscriberExist = await SuscriberModel.findOne({  email: email, website: website })
        if(emailSubscriberExist){
            return res.status(400).json({ success: false, data: 'Subscriber already exist' })
        }
        const newSubscribers = await SuscriberModel.create({
            email, website, siteName
        })

        res.status(200).json({ success: true, data: `Succesful subscribe to ${siteName ? siteName : ''} newsletter` })
    } catch (error) {
        console.log('UNABLE TO ADD SUSCRIPTION', error)
        res.status(500).json({ success: false, data: 'Unable to add subscription' })
    }
}

export async function removeSuscriber(req, res) {
    const { email, website } = req.body
    try {
        const emailSubscriberExist = await SuscriberModel.findOne({  email: email, website: website })
        if(!emailSubscriberExist){
            return res.status(400).json({ success: false, data: 'Subscriber does not exist' })
        }

        const deleteSubscriber = await SuscriberModel.findByIdAndDelete({ _id: emailSubscriberExist?._id })

        res.status(200).json({ success: false, data: 'Subscriber deleted successful'})
    } catch (error) {
        console.log('UNABLE TO ADD SUSCRIPTION', error)
        res.status(500).json({ success: false, data: 'Unable to add subscription' })
    }
}