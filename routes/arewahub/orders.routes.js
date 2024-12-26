import express from "express";
import { AuthenticateAdmin } from "../../middlewares/auth.js";
import * as controllers from '../../controllers/arewahub/order.controllers.js'

const router = express.Router()

//POST ROUTES
router.post('/newOrder', controllers.newOrder)
router.post('/approveOrderDelivered', AuthenticateAdmin, controllers.approveOrderDelivered)
router.post('/togglePayment', AuthenticateAdmin, controllers.togglePayment)


//GET ROUTES
router.get('/fetAllOrders', AuthenticateAdmin, controllers.fetAllOrders)
router.get('/fetchOrder/:id', AuthenticateAdmin, controllers.fetchOrder)
router.get('/getRevenueAndOrder/:period', AuthenticateAdmin, controllers.getRevenueAndOrder)
router.get('/getTopSellingProduct', AuthenticateAdmin, controllers.getTopSellingProduct)


export default router
