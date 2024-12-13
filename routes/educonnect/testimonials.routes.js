import express from 'express'
import * as controllers from '../../controllers/educonnect/testimonies.controllers.js'

const router = express.Router()

//POST ROUTES
router.post('/sendMessage', controllers.newTestimonials )

//GET ROUTES
router.post('/getAllTestimonies', controllers.newTestimonials )
router.post('/getATestimonies/:id', controllers.getATestimonies )



//PUT ROUTES

export default router
