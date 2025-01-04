import Mailgen from "mailgen"
import mailer from "../../middlewares/mailer.js"
import { generateUniqueCode } from "../../middlewares/utils.js"
import ContactUsModel from "../../models/acn/ContactUs.js"
import NotificationModel from "../../models/NotificationModel.js"

const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'EduConnect Africa',
        link: `${process.env.APP_LINK}`
    }
})

export async function newContactUsMsg(req, res) {
    const { firstName, lastName, email, reason, message } = req.body
    if(!firstName){
        return res.status(500).json({ success: false, data: 'First name is required' })
    }
    if(!lastName){
        return res.status(500).json({ success: false, data: 'Last name is required' })
    }
    if(!email){
        return res.status(500).json({ success: false, data: 'Email address is required' })
    }
    if(!reason){
        return res.status(500).json({ success: false, data: 'reason is required' })
    }
    if(!message){
        return res.status(500).json({ success: false, data: 'Message is required' })
    }
    try {
        const messageId = await generateUniqueCode(6)
        console.log('MESSAGE ID>>', `EC${messageId}`)

        const newMessage = ContactUsModel.create({
            firstName, lastName, email, reason, message, messageId
        })

        const newNotification = await NotificationModel.create({
            message: `${firstName} ${lastName} sent a message for ACN website`,
            actionBy: `${firstName} ${lastName}`,
            name: `${firstName} ${lastName}`
        });

        res.status(201).json({ success: true, data: 'Message Submitted Successful' })
    } catch (error) {
        console.log('UNABLE TO CREATE A NEW CONTACT US MESSAGE (EDUCONNECT)', error)
        res.status(500).json({ success: false, data: 'Unable to submit contact us form' })
    }
}

export async function replyMessage(req, res){
    const { replyMsg, id } = req.body
    const { _id, firstName, lastName } = req.user
    if(!id){
        return res.status(400).json({ success: false, data: 'Provide message Id' })
    }
    try {
        const findMessage = await ContactUsModel.findById({ _id: id })
        if(!findMessage){
            return res.status(404).json({ success: false, data: 'Message not Found' })
        }

        // send mail
        try {
            const emailContent = {
                body: {
                    intro: `${replyMsg}`,
                },
            };

            const emailTemplate = mailGenerator.generate(emailContent)
            const emailText = mailGenerator.generatePlaintext(emailContent)

            try {
                await mailer({
                    to: findMessage.email,
                    subject: `Hi, ${findMessage?.firstName} ${findMessage?.lastName}`,
                    text: emailTemplate
                })

                findMessage.reply = replyMsg
                findMessage.save()
                const newNotification = await NotificationModel.create({
                    message: `${firstName} ${lastName} replied a message from ${findMessage?.firstName} ${findMessage?.lastName} ACN website`,
                    actionBy: `${_id}`,
                    name: `${firstName} ${lastName}`
                });

                return res.status(200).json({success: true, msg: 'Email sent', data: findMessage?.email })
                
            } catch (error) {
                console.log('ERROR REPLYING USER MESSAGE?>', error)
            }
            
        } catch (error) {
            console.log('Email could not be sent >>',error)
            return res.status(500).json({ success: false, data: 'Email could not be sent' })
        }


        res.status(200).json({ success: true, data: 'Success' })
    } catch (error) {
        console.log('UNABLE TO REPLY USER', error)
        res.status(500).json({ success: false, data: 'Unable to reply user' })
    }
}

export async function deleteMessage(req, res) {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ success: false, data: 'Id is required' })
    }
    try {
        const findMessage = await ContactUsModel.findById({ _id: id })
        if(!findMessage){
            return res.status(404).json({ success: false, data: 'Message not Found' })
        }
        const handleDelete = await ContactUsModel.findByIdAndDelete({ _id: id })

        res.status(200).json({ success: true, data: 'Message Deleted succesful' })
    } catch (error) {
        console.log('UNABLE TO DELETE MESSAGE', error)
        res.status(500).json({ success: false, data: 'Unable to delete message' })
    }
}

export async function getAllMessages(req, res) {
    try {
        const allMessages = await ContactUsModel.find().sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: allMessages })
    } catch (error) {
        console.log('UABLE TO GET ALL MESSAGE (EDUCONNECT)', error)
        res.status(500).json({ success: false, data: 'Unable to get all message' })
    }
}

export async function getAMessages(req, res) {
    const { id } = req.params
    if(!id){
        return res.status(400).json({ success: false, data: 'Provide message Id' })
    }
    try {
        const message = await ContactUsModel.findById({ _id: id })
        if(!message){
            return res.status(404).json({ success: false, data: 'Message with this Id does not exist' })
        }
        res.status(200).json({ success: true, data: message })
    } catch (error) {
        console.log('UABLE TO GET ALL MESSAGE (EDUCONNECT)', error)
        res.status(500).json({ success: false, data: 'Unable to get all message' })
    }
}