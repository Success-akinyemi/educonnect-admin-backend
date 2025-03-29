import express from 'express'
import * as controllers from '../../controllers/arewahub/becomeAmember.controllers.js'
import { uploadImages } from '../../middlewares/multer.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/newMember', uploadImages, controllers.becomeAMember )
router.post('/downloadPDF', AuthenticateAdmin, controllers.downloadPDF )
router.post('/downloadCSV', AuthenticateAdmin, controllers.downloadCSV )


//GET ROUTES
router.get('/getMembers', AuthenticateAdmin, controllers.getMembers )
router.get('/getAMember/:id', AuthenticateAdmin, controllers.getAMembers )


//PUT ROUTES

export default router
