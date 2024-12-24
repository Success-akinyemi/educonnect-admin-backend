import express from 'express'
import * as controllers from '../../controllers/acn/team.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'
import { uploadImages } from '../../middlewares/multer.js'

const router = express.Router()

//POST ROUTES
router.post('/newTeam', uploadImages, controllers.newTeam )
router.post('/editeam', uploadImages, AuthenticateAdmin, controllers.editeam )
router.post('/toggleActiveStatus', AuthenticateAdmin, controllers.toggleActiveStatus )
router.post('/deleteTeamMember', AuthenticateAdmin, controllers.deleteTeamMember)



//GET ROUTES
router.get('/getAllTeam', controllers.getAllTeam )
router.get('/getAdminAllTeam', controllers.getAdminAllTeam )
router.get('/getTeam/:id', controllers.getTeam )




//PUT ROUTES

export default router
