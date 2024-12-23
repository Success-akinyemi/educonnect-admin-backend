import express from 'express'
import * as controllers from '../../controllers/acn/donations.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/newDonation', controllers.newDonation )
router.post('/toggleActiveStatus', AuthenticateAdmin, controllers.toggleActiveStatus )
router.post('/deleteDonation', AuthenticateAdmin, controllers.deleteDonation )


//GET ROUTES
router.get('/getAllDonation', controllers.getAllDonation )
router.get('/getADonation/:id', controllers.getDonation )




//PUT ROUTES

export default router
