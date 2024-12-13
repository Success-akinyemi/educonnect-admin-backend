import express from 'express'
import * as controllers from '../controllers/auth.controllers.js'

const router = express.Router()

router.post('/verifyOtp', controllers.verifyOtp )



//PUT ROUTES

export default router
