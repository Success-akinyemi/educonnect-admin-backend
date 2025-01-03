import express from 'express'
import * as controllers from '../../controllers/educonnect/contactUs.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/sendMessage', controllers.newContactUsMsg )
router.post('/replyMessage', AuthenticateAdmin, controllers.replyMessage )
router.post('/deleteMessage', AuthenticateAdmin, controllers.deleteMessage )



//GET ROUTES
router.get('/getAllContactUs', controllers.getAllMessages )
router.get('/getAContactUs/:id', controllers.getAMessages )




//PUT ROUTES

export default router
