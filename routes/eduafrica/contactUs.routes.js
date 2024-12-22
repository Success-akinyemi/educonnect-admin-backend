import express from 'express'
import * as controllers from '../../controllers/educonnect/contactUs.controllers.js'

const router = express.Router()

//POST ROUTES
router.post('/sendMessage', controllers.newContactUsMsg )
router.post('/replyMessage', controllers.replyMessage )



//GET ROUTES
router.get('/getAllContactUs', controllers.getAllMessages )
router.get('/getAContactUs/:id', controllers.getAMessages )




//PUT ROUTES

export default router
