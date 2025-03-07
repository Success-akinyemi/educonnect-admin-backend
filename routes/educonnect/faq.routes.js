import express from 'express'
import * as controllers from '../../controllers/educonnect/faq.controllers.js'

const router = express.Router()

//POST ROUTES
router.post('/newFaq', controllers.newFaq )
router.post('/updateFaq', controllers.updateFaq )
router.post('/deleteFaq', controllers.deleteFaq )
router.post('/toggleFaqActive', controllers.toggleFaqActive )

router.post('/deleteAllFaq', controllers.deleteAllFaq )


//GET ROUTES
router.get('/getAllFaq', controllers.getFaqs )
router.get('/getAFaq/:id', controllers.getFaq )



//PUT ROUTES

export default router
