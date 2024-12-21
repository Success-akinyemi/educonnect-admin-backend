import express from "express";
import { AuthenticateAdmin } from "../../middlewares/auth.js";
import * as controllers from '../../controllers/arewahub/order.controllers.js'

const router = express.Router()

//POST ROUTES
router.post('/newOrder', controllers.newOrder)
router.post('/approveOrderDelivered', AuthenticateAdmin, controllers.approveOrderDelivered)

//GET ROUTES
router.get('/fetAllOrders', AuthenticateAdmin, controllers.fetAllOrders)
router.get('/fetchOrder/:id', AuthenticateAdmin, controllers.fetchOrder)

export default router
