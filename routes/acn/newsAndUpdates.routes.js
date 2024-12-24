import express from 'express'
import * as controllers from '../../controllers/acn/newsAndUpdates.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'
import upload from '../../middlewares/multer.js'

const router = express.Router()

//POST ROUTES
router.post('/newNews', upload.single("image"), AuthenticateAdmin, controllers.newNews )
router.post('/updateNews', upload.single("image"), AuthenticateAdmin, controllers.updateNews )
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
