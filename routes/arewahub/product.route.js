import express from "express";
import { AuthenticateAdmin } from "../../middlewares/auth.js";
import * as controllers from '../../controllers/arewahub/product.controllers.js'
import upload from "../../middlewares/multer.js";

const router = express.Router()

//POST ROUTES
router.post('/newProduct', upload.single("image"), AuthenticateAdmin, controllers.addProdcut)
router.post('/updateProduct', AuthenticateAdmin, controllers.editProduct)
router.post('/deleteProduct', AuthenticateAdmin, controllers.deleteProduct)
router.post('/toggleActive', AuthenticateAdmin, controllers.toggleActiveStatus)

//GET ROUTES
router.get('/products', controllers.getAllProduct)
router.get('/product/:id', controllers.getAProduct)

export default router
