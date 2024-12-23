import express from 'express'
import * as controllers from '../controllers/adminAuth.controllers.js'

const router = express.Router()

router.post('/register', controllers.register )
router.post('/login', controllers.login )
router.post('/resendOtp', controllers.resendOtp )
router.post('/forgotPassword', controllers.forgotPassword )
router.post('/resetPassword/:resetToken', controllers.resetPassword )
router.post('/editProfile', controllers.editProfile )
router.post('/updatePassword', controllers.updatePassword )
router.post('/logout', controllers.logout )



//GET ROUTES
router.get('/getAllAdmin', controllers.getAllAdmin )


//PUT ROUTES

export default router
