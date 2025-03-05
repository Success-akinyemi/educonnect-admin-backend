import express from 'express'
import * as controllers from '../../controllers/arewahub/becomeAmember.controllers.js'
import { uploadImages } from '../../middlewares/multer.js'

const router = express.Router()

//POST ROUTES
router.post('/newMember', uploadImages, controllers.becomeAMember )


//GET ROUTES
router.get('/getMembers', controllers.getMembers )


//PUT ROUTES

export default router
