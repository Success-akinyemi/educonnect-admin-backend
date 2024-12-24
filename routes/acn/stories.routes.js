import express from 'express'
import * as controllers from '../../controllers/acn/stories.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'
import upload from '../../middlewares/multer.js'

const router = express.Router()

//POST ROUTES
router.post('/newStory', upload.single("image"), AuthenticateAdmin, controllers.newStory )
router.post('/updateStory', upload.single("image"), AuthenticateAdmin, controllers.updateStory )
router.post('/toggleActive', AuthenticateAdmin, controllers.toggleActive )
router.post('/deleteStory', AuthenticateAdmin, controllers.deleteStory )

//GET ROUTES
router.get('/getAllStories', AuthenticateAdmin, controllers.getAllStories )
router.get('/getAStory/:id', AuthenticateAdmin, controllers.getAStory )

//USER GET USERS
router.get('/getUserAllStories', controllers.getUserAllStories )
router.get('/getUserAStory/:id', controllers.getUserAStory )




//PUT ROUTES

export default router
