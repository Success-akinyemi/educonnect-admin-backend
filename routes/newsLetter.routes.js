import express from 'express'
import * as controllers from '../controllers/newsLetter.controllers.js'
import { uploadImages } from '../middlewares/multer.js'
import { AuthenticateAdmin } from '../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/newNewsletter', AuthenticateAdmin, uploadImages, controllers.newNewsletter )
router.post('/editNewsLetter', AuthenticateAdmin, uploadImages, controllers.editNewsLetter )
router.post('/deleteNewsLetter', AuthenticateAdmin, controllers.deleteNewsLetter )


//GET ROUTES
router.get('/getNewsLetter', controllers.getNewsLetter )
router.get('/getANewsLetter/:id', controllers.getANewsLetter )



//PUT ROUTES

export default router
