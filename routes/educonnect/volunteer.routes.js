import express from 'express'
import * as controllers from '../../controllers/educonnect/volunteer.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/becomeAVolunteer', controllers.becomeAVolunteer )
router.post('/acceptOrRejectVolunteers', AuthenticateAdmin, controllers.acceptOrRejectVolunteers)


//GET ROUTES
router.get('/getAllVolunteers', AuthenticateAdmin, controllers.getAllVolunteers )
router.get('/getAVolunteer/:id', AuthenticateAdmin, controllers.getAVolunteer )



//PUT ROUTES

export default router
