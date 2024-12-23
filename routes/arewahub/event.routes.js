import express from "express";
import { AuthenticateAdmin } from "../../middlewares/auth.js";
import * as controllers from '../../controllers/arewahub/events.controllers.js'

const router = express.Router()

//POST ROUTES
router.post('/newEvent', AuthenticateAdmin, controllers.newEvent)
router.post('/updateEvent', AuthenticateAdmin, controllers.updateEvent)
router.post('/deleteEvent', AuthenticateAdmin, controllers.deleteEvent)

//GET ROUTES
router.get('/getEvents', controllers.getEvents)

router.get('/getPastEvents', controllers.getEvents)
router.get('/getFutureEvents', controllers.getEvents)

router.get('/getEvent/:id', controllers.getEvent)

export default router
