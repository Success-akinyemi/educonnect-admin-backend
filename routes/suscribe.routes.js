import express from 'express'
import * as controllers from '../controllers/suscribe.controllers.js'

const router = express.Router()

router.post('/addSuscriber', controllers.addSuscriber )



//PUT ROUTES

export default router
