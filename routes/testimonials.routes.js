import express from 'express'
import * as controllers from '../controllers/testimonies.controllers.js'
import { AuthenticateAdmin } from '../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/newTestimony', controllers.newTestimonials )
router.post('/toggleBlacklist', controllers.toggleBlacklist )
router.post('/toggleApproveTestimony', controllers.toggleApproveTestimony )
router.post('/deleteTestimony', AuthenticateAdmin, controllers.deleteTestimony )


//GET ROUTES
router.get('/getAllTestimonies', controllers.newTestimonials )
router.get('/getATestimonies/:id', controllers.getATestimonies )
router.get('/getSectionTestimonies/:value', controllers.getSectionTestimonies )
router.get('/getSectionActiveTestimonies/:value', controllers.getSectionActiveTestimonies )
router.get('/getActiveTestimonies', controllers.getActiveTestimonies )




//PUT ROUTES

export default router
