import express from "express";
import { AuthenticateAdmin } from "../../middlewares/auth.js";
import * as controllers from '../../controllers/arewahub/events.controllers.js'
import { uploadImages } from "../../middlewares/multer.js";
import multer from "multer";

const router = express.Router()

// Custom error handler for Multer
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        console.error(`Unexpected field: ${err.field}`);
        return res.status(400).json({ error: `Unexpected field: ${err.field}` });
      }
    }
    console.log('MULTER  ERROR', err)
    next(err); // Pass to the next error handler if not a Multer error
  };

//POST ROUTES
router.post('/newEvent', uploadImages, multerErrorHandler, AuthenticateAdmin, controllers.newEvent)
router.post('/updateEvent', uploadImages, AuthenticateAdmin, controllers.updateEvent)
router.post('/deleteEvent', AuthenticateAdmin, controllers.deleteEvent)

//GET ROUTES
router.get('/getEvents', controllers.getEvents)

router.get('/getPastEvents', controllers.getPastEvents)
router.get('/getFutureEvents', controllers.getFutureEvents)
router.get('/getLatestEvents', controllers.getLatestEvents)

router.get('/getEvent/:id', controllers.getEvent)

export default router
