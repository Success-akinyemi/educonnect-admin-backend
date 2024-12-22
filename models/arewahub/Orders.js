import mongoose from "mongoose";

const OrdersSchema = new mongoose.Schema({ 
    customerName: {
        type: String,
        required: [true, 'Customer name is required']
    },
    customerEmail: {
        type: String,
        required: [ true, 'Customer Email' ]
    },
    phoneNumber: {
        type: String,
        required: [ true, 'Customer Phone Number is required' ]
    },
    address: {
        type: String,
    },
    amount: {
        type: Number,
    },
    orderId: {
        type: String,
        required: [ true, 'Order Id is required' ]
    },
    status: {
        type: String,
        default: 'Pending',
    },
    paid: {
        type: Boolean,
        default: false
    },
    items: {
        type: Array
    }
},
{ timestamps: true}
)

const OrderModel = mongoose.model('arewahubproductorder', OrdersSchema)
export default OrderModel