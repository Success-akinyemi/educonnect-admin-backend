import express from 'express'
import * as controllers from '../../controllers/acn/newsAndUpdates.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'
import { uploadImages } from '../../middlewares/multer.js'

const router = express.Router()

//POST ROUTES
router.post('/newNews', uploadImages, AuthenticateAdmin, controllers.newNews )
router.post('/updateNews', uploadImages, AuthenticateAdmin, controllers.updateNews )
router.post('/toggleActive', AuthenticateAdmin, controllers.toggleActive )
router.post('/deleteNewsAndUpdate', AuthenticateAdmin, controllers.deleteNews )

//GET ROUTES
router.get('/getAllNewsAndUpdates', AuthenticateAdmin, controllers.getAllNewsAndUpdates )
router.get('/getANewsAndUpdates/:id', AuthenticateAdmin, controllers.getANewsAndUpdates )

//USER GET USERS
router.get('/getUserAllNewsAndUpdates', controllers.getUserAllNewsAndUpdates )
router.get('/getUserANewsAndUpdates/:id', controllers.getUserANewsAndUpdates )




//PUT ROUTES

export default router
