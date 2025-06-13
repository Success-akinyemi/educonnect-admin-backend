import express from 'express'
import * as controllers from '../../controllers/educonnect/member.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/becomeAMember', controllers.becomeAVolunteer )
router.post('/acceptOrRejectMembers', AuthenticateAdmin, controllers.acceptOrRejectMembers)


//GET ROUTES
router.get('/getAllMembers', AuthenticateAdmin, controllers.getAllMembers )
router.get('/getAMember/:id', AuthenticateAdmin, controllers.getAMember )



//PUT ROUTES

export default router
