import express from 'express'
import * as controllers from '../controllers/adminAuth.controllers.js'
import { AuthenticateAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.post('/register', controllers.register )
router.post('/login', controllers.login )
router.post('/resendOtp', controllers.resendOtp )
router.post('/forgotPassword', controllers.forgotPassword )
router.post('/resetPassword/:resetToken', controllers.resetPassword )
router.post('/editProfile', AuthenticateAdmin, controllers.editProfile )
router.post('/updatePassword', AuthenticateAdmin, controllers.updatePassword )
router.post('/logout', controllers.logout )



//GET ROUTES
router.get('/getAllAdmin', AuthenticateAdmin, controllers.getAllAdmin )


//PUT ROUTES

export default router
