import express from 'express'
import * as controllers from '../controllers/notification.controllers.js'
import { AuthenticateAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.post('/markAsRead', AuthenticateAdmin, controllers.markAsRead )

router.get('/getNotifications', AuthenticateAdmin, controllers.getNotifications )




//PUT ROUTES

export default router
