import express from "express";
import { AuthenticateAdmin } from "../../middlewares/auth.js";
import * as controllers from '../../controllers/arewahub/product.controllers.js'
import { uploadImages } from "../../middlewares/multer.js";

const router = express.Router()

//POST ROUTES
router.post('/newProduct', uploadImages, AuthenticateAdmin, controllers.addProdcut)
router.post('/updateProduct', uploadImages, AuthenticateAdmin, controllers.editProduct)
router.post('/deleteProduct', AuthenticateAdmin, controllers.deleteProduct)
router.post('/toggleActive', AuthenticateAdmin, controllers.toggleActiveStatus)

//GET ROUTES
router.get('/products', controllers.getAllProduct)
router.get('/fetchProducts', controllers.fetchProducts)
router.get('/product/:id', controllers.getAProduct)

export default router
