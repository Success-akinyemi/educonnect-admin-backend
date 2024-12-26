import express from 'express'
import * as controllers from '../controllers/newsLetter.controllers.js'
import { uploadImages } from '../middlewares/multer.js'

const router = express.Router()

//POST ROUTES
router.post('/newNewsletter', uploadImages, controllers.newNewsletter )
router.post('/editNewsLetter', uploadImages, controllers.editNewsLetter )
router.post('/deleteNewsLetter', controllers.deleteNewsLetter )


//GET ROUTES
router.get('/getNewsLetter', controllers.getNewsLetter )
router.get('/getANewsLetter/:id', controllers.getANewsLetter )



//PUT ROUTES

export default router
