import express from 'express'
import * as controllers from '../controllers/newsLetter.controllers.js'

const router = express.Router()

//POST ROUTES
router.post('/newNewsletter', controllers.newNewsletter )
router.post('/editNewsLetter', controllers.editNewsLetter )
router.post('/deleteNewsLetter', controllers.deleteNewsLetter )


//GET ROUTES
router.get('/getNewsLetter', controllers.getNewsLetter )
router.get('/getANewsLetter/:id', controllers.getANewsLetter )



//PUT ROUTES

export default router
