import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [ true, 'Product name is required']
    },
    productId: {
        type: String,
        required: [true, 'Product Id is required'],
        unique: [ true, 'Product with this Id already exist']
    },
    quantityInStock: {
        type: Number,
        default: 0
    },
    quantitySold: {
        type: Number,
        default: 0
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    productType: {
        type: String,
        //required: [ true, 'Product type is required' ]
    },
    active: {
        type: Boolean,
        default: true
    }
},
{ timestamps: true }
)

const ProductModel = mongoose.model('arewahubproduct', ProductSchema)
export default ProductModel 