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
        if(website == 'acn'){
            siteName = 'Afrivan Child Network'
        }
        if(website == 'arewahub'){
            siteName = 'Arewa Hub'
        }
        const newSubscribers = await SuscriberModel.create({
            email, website
        })

        res.status(200).json({ success: true, data: `Succesful subscribe to ${siteName ? siteName : ''} newsletter` })
    } catch (error) {
        console.log('UNABLE TO ADD SUSCRIPTION', error)
        res.status(500).json({ success: false, data: 'Unable to add subscription' })
    }
}

export async function removeSuscriber(req, res) {
    const { email } = req.body
    try {
        
    } catch (error) {
        console.log('UNABLE TO ADD SUSCRIPTION', error)
        res.status(500).json({ success: false, data: 'Unable to add subscription' })
    }
}