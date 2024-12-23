import express from 'express'
import * as controllers from '../../controllers/arewahub/team.controllers.js'
import { AuthenticateAdmin } from '../../middlewares/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/newTeam', controllers.newTeam )
router.post('/editeam', AuthenticateAdmin, controllers.editeam )
router.post('/toggleActiveStatus', AuthenticateAdmin, controllers.toggleActiveStatus )
router.post('/deleteTeamMember', AuthenticateAdmin, controllers.deleteTeamMember)



//GET ROUTES
router.get('/getAllTeam', controllers.getAllTeam )
router.get('/getTeam/:id', controllers.getTeam )




//PUT ROUTES

export default router