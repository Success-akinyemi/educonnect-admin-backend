import express from 'express'
import * as controllers from '../../controllers/educonnect/champion.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/becomeAChampion', controllers.becomeAChampion )
router.post('/acceptOrRejectChampion', AuthenticateAdmin, controllers.acceptOrRejectChampion)


//GET ROUTES
router.get('/getAllChampion', AuthenticateAdmin, controllers.getAllChampion )
router.get('/getAChapion/:id', AuthenticateAdmin, controllers.getAChapion )



//PUT ROUTES

export default router
