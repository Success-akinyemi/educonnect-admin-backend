import { generateUniqueCode } from "../../middlewares/utils.js"
import OrderModel from "../../models/arewahub/Orders.js"
import ProductModel from "../../models/arewahub/Product.js"

export async function newOrder(req, res) {
    const { customerName, customerEmail, phoneNumber, address, items } = req.body;

    if (!customerName) {
        return res.status(400).json({ success: false, data: 'Customer name is required' });
    }
    if (!customerEmail) {
        return res.status(400).json({ success: false, data: 'Customer email is required' });
    }
    if (!phoneNumber) {
        return res.status(400).json({ success: false, data: 'Customer phone number is required' });
    }
    if (items?.length < 1) {
        return res.status(400).json({ success: false, data: 'At least one product is required' });
    }

    try {
        // Get the IDs of all products in the items array
        const productIds = items.map((item) => item.id);

        // Fetch products with the specified IDs that are active
        const products = await ProductModel.find({ 
            productId: { $in: productIds }, 
            active: true 
        });

        if (!products || products.length < 1) {
            return res.status(403).json({ success: false, data: 'No valid products found in the order' });
        }

        // Map fetched products to calculate total amounts
        let totalAmount = 0;
        const productDetails = products.map((product) => {
            const item = items.find((i) => i.id === product.productId.toString());
            const quantity = item?.quantity || 1; // Default quantity to 1 if not provided
            const itemTotal = product.price * quantity;
            totalAmount += itemTotal;

            return {
                id: product?._id,
                productId: product?.productId,
                name: product.productName,
                price: product.price,
                quantity: quantity,
                total: itemTotal,
                image: product?.image
            };
        });

        if (productDetails.length < 1 || totalAmount === 0) {
            return res.status(403).json({ success: false, data: 'Invalid order' });
        }

        const orderId = await generateUniqueCode(8);
        console.log('ORDER ID', orderId);

        const newOrder = await OrderModel.create({
            customerName,
            customerEmail,
            phoneNumber,
            address,
            amount: totalAmount,
            items: productDetails,
            orderId: orderId,
        });

        // Send payment gateway response or further processing
        res.status(201).json({ success: true, data: 'Order created successfully' });
    } catch (error) {
        console.log('UNABLE TO CREATE NEW ORDER', error);
        res.status(500).json({ success: false, data: 'Unable to create new order' });
    }
}

export async function approveOrderDelivered(req, res) {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ success: false, data: 'Order Id is required' })
    }
    try {
        const order = await OrderModel.findById({ _id: id })
        if(!order){
            return res.status(404).json({ success: false, data: 'Order not found' })
        }

        order.status === 'Approved' ? order.status = 'Pending' : order.status = 'Approved'
        order.save()
        console.log('object stats', order.status)

        res.status(200).json({ success: true, data: 'Order Status updated' })
    } catch (error) {
        console.log('UNABLE TO TOGGLE ORDER APPROVAL', error)
        res.status(500).json({ success: false, data: 'Unable to toggle order approval' })
    }
}

export async function togglePayment(req, res) {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ success: false, data: 'Order Id is required' })
    }
    try {
        const order = await OrderModel.findById({ _id: id })
        if(!order){
            return res.status(404).json({ success: false, data: 'Order not found' })
        }

        order.paid = !order.paid
        await order.save()


        res.status(200).json({ success: true, data: 'Order payment status updated' })
    } catch (error) {
        console.log('UNABLE TO TOGGLE ORDER APPROVAL', error)
        res.status(500).json({ success: false, data: 'Unable to toggle order approval' })
    }
}

export async function fetAllOrders(req, res) {
    try {
        const orders = await OrderModel.find()

        res.status(200).json({ success: true, data: orders })
    } catch (error) {
        console.log('UNABLE TO GET ALL ORDERS', error)
        res.status(500).json({ success: false, data: 'Unable to get all orders' })
    }
}

export async function fetchOrder(req, res) {
    const { id } = req.params
    if(!id){
        return res.status(400).json({ success: false, data: 'Order Id is required' })
    }
    try {
        const order = await OrderModel.findById({ _id: id })
        if(!order){
            return res.status(404).json({ success: false, data: 'Order not found' })
        }

        res.status(200).json({ success: true, data: order })
    } catch (error) {
        console.log('UNABLE TO GET ORDER', error)
        res.status(500).json({ success: false, data: 'Failed to get order' })
    }
}