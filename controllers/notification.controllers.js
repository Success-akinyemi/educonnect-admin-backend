import NotificationModel from "../models/NotificationModel.js"

export async function getNotifications(req, res) {
    try {
        const notificationsData = await NotificationModel.find().sort({ createdAt: -1 })

        const notifications = notificationsData?.splice(0, 10)

        res.status(200).json({ success: false, data: notifications })
    } catch (error) {
        console.log('UNABLE TO GET NOTIFICATIONS', error)
        res.status(500).json({ success: false, data: 'Unable to get notifications' })
    }
}

export async function getNotification(req, res) {
    const { id } = req.params
    if(!id){
        return res.status(400).json({ success: false, data: 'Id is required' })
    }
    try {
        const notificationData = await NotificationModel.findById({ _id: id })
        if(!notificationData){
            return res.status (404).json({ success: false, data: 'No notification found' })
        }

        res.status(200).json({ success: false, data: notificationData })
    } catch (error) {
        console.log('UNABLE TO GET NOTIFICATIONS', error)
        res.status(500).json({ success: false, data: 'Unable to get notifications' })
    }
}

export async function markAsRead(req, res) {
    try {
        // Update all notifications, setting read to true
        await NotificationModel.updateMany({}, { $set: { read: true } });
        
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.log('UNABLE TO MARK AS READ', error);
        res.status(500).json({ success: false, data: 'Unable to mark notifications as read' });
    }
}