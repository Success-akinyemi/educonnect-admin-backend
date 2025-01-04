import { generateUniqueCode } from "../../middlewares/utils.js"
import OrderModel from "../../models/arewahub/Orders.js"
import ProductModel from "../../models/arewahub/Product.js"
import moment from 'moment'; 
import NotificationModel from "../../models/NotificationModel.js";

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
                image: product?.image,
                productForm: product?.productForm
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

        const newNotification = await NotificationModel.create({
            message: `${customerName} placed a new order for product in arewahub product`,
            actionBy: `${customerName}`,
            name: `${customerName}`
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
    const { _id, firstName, lastName } = req.user
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

        const newNotification = await NotificationModel.create({
            message: order.status === 'Approved' ? `${firstName} ${lastName} has approved the order delivery for ${order?.customerName} ID: ${order?.orderId}` : `${firstName} ${lastName} has unapproved the order delivery for ${order?.customerName} ID: ${order?.orderId}`,
            actionBy: `${_id}`,
            name: `${firstName} ${lastName}`
        });

        res.status(200).json({ success: true, data: 'Order Status updated' })
    } catch (error) {
        console.log('UNABLE TO TOGGLE ORDER APPROVAL', error)
        res.status(500).json({ success: false, data: 'Unable to toggle order approval' })
    }
}

export async function togglePayment(req, res) {
    const { id } = req.body
    const { _id, firstName, lastName } = req.user
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

        const newNotification = await NotificationModel.create({
            message: order.paid  ? `${firstName} ${lastName} has approved the payment order of ${order?.customerName} ID: ${order?.orderId}` : `${firstName} ${lastName} has unapproved the payment order of ${order?.customerName} ID: ${order?.orderId}`,
            actionBy: `${_id}`,
            name: `${firstName} ${lastName}`
        });


        res.status(200).json({ success: true, data: 'Order payment status updated' })
    } catch (error) {
        console.log('UNABLE TO TOGGLE ORDER APPROVAL', error)
        res.status(500).json({ success: false, data: 'Unable to toggle order approval' })
    }
}

export async function deleteOrder(req, res) {
    const { id } = req.body
    const { _id, firstName, lastName } = req.user
    if(!id){
        return res.status(400).json({ success: false, data: 'Order Id is required' })
    }
    try {
        const order = await OrderModel.findById({ _id: id })
        if(!order){
            return res.status(404).json({ success: false, data: 'Order not found' })
        }

        const handleDeleteOrder = await OrderModel.findByIdAndDelete({ _id: id })

        const newNotification = await NotificationModel.create({
            message: `${firstName} ${lastName} has deleted an order ID: ${order?.orderId}`,
            actionBy: `${_id}`,
            name: `${firstName} ${lastName}`
        });

        res.status(200).json({ success: true, data: 'Order deleted' })
    } catch (error) {
        console.log('UNABLE TO TOGGLE ORDER APPROVAL', error)
        res.status(500).json({ success: false, data: 'Unable to toggle order approval' })
    }
}

export async function fetAllOrders(req, res) {
    try {
        const orders = await OrderModel.find().sort({ createdAt : -1 })

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

// Helper function to calculate the date range based on selected period
function getDateRange(period, isPrevious = false) {
    const now = moment();
    let startDate;

    // Adjust based on whether you're calculating the previous period
    if (isPrevious) {
        now.subtract(1, 'day'); // Move one day back to get the full range of the previous period
    }

    switch (period) {
        case '12mth':
            startDate = now.clone().subtract(12, 'months'); // Use clone to preserve the original 'now'
            break;
        case '3mth':
            startDate = now.clone().subtract(3, 'months');
            break;
        case '30days':
            startDate = now.clone().subtract(30, 'days');
            break;
        case '7days':
            startDate = now.clone().subtract(7, 'days');
            break;
        case '24hrs':
            startDate = now.clone().subtract(24, 'hours');
            break;
        default:
            startDate = now.clone().subtract(30, 'days'); // Default to 30 days if no period is selected
            break;
    }

    return { startDate: startDate.toDate(), endDate: now.toDate() };
}

// Endpoint to get revenue and order details
export async function getRevenueAndOrder(req, res) {
    try {
        const { period } = req.params; // Get the selected period from the URL params (e.g., '12mth', '3mth')
        console.log('PERIOD:', period);

        // Validate the period parameter
        if (!period || !['12mth', '3mth', '30days', '7days', '24hrs'].includes(period)) {
            return res.status(400).json({ success: false, message: 'Invalid period provided.' });
        }

        // Get current period date range
        const { startDate, endDate } = getDateRange(period);

        // Fetch orders within the selected period (current period)
        const paidOrders = await OrderModel.aggregate([
            { $match: { paid: true, createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalPaid: { $sum: '$amount' } } }
        ]);

        const pendingOrders = await OrderModel.aggregate([
            { $match: { status: 'Pending', createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of pending orders
        ]);

        const approvedOrders = await OrderModel.aggregate([
            { $match: { status: 'Approved', createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of approved orders
        ]);

        const allOrders = await OrderModel.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of all orders
        ]);

        // Get previous period data (calculate previous period range)
        const { startDate: prevStartDate, endDate: prevEndDate } = getDateRange(period, true); // isPrevious = true

        // Fetch orders for the previous period
        const prevPaidOrders = await OrderModel.aggregate([
            { $match: { paid: true, createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
            { $group: { _id: null, totalPaid: { $sum: '$amount' } } } // Sum up the amount for paid orders
        ]);

        const prevPendingOrders = await OrderModel.aggregate([
            { $match: { status: 'Pending', createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of pending orders
        ]);

        const prevApprovedOrders = await OrderModel.aggregate([
            { $match: { status: 'Approved', createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of approved orders
        ]);

        const prevAllOrders = await OrderModel.aggregate([
            { $match: { createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of all orders
        ]);

        // Calculate percentages and determine whether the percentage is positive or negative
        const calculatePercentage = (currentValue, previousValue) => {
            if (previousValue === 0) {
                return { percentage: currentValue === 0 ? 0 : 100, percentageType: 'positive' };
            }
            const percentage = ((currentValue - previousValue) / previousValue) * 100;
            const percentageType = percentage >= 0 ? 'positive' : 'negative';
            return { percentage, percentageType };
        };

        const paidPercentageData = calculatePercentage(paidOrders[0]?.totalPaid || 0, prevPaidOrders[0]?.totalPaid || 0);
        const pendingPercentageData = calculatePercentage(pendingOrders[0]?.totalCount || 0, prevPendingOrders[0]?.totalCount || 0);
        const approvedPercentageData = calculatePercentage(approvedOrders[0]?.totalCount || 0, prevApprovedOrders[0]?.totalCount || 0);
        const allOrdersPercentageData = calculatePercentage(allOrders[0]?.totalCount || 0, prevAllOrders[0]?.totalCount || 0);

        const data = {
            totalRevenue: {
                total: paidOrders.length ? paidOrders[0].totalPaid : 0,
                percentage: paidPercentageData.percentage,
                percentageType: paidPercentageData.percentageType,
            },
            totalPending: { 
                total: pendingOrders.length ? pendingOrders[0].totalCount : 0,
                percentage: pendingPercentageData.percentage,
                percentageType: pendingPercentageData.percentageType,
            },
            totalApproved: {
                total: approvedOrders.length ? approvedOrders[0].totalCount : 0,
                percentage: approvedPercentageData.percentage,
                percentageType: approvedPercentageData.percentageType,
            },
            totalPeopleOrder: {
                total: allOrders.length ? allOrders[0].totalCount : 0,
                percentage: allOrdersPercentageData.percentage,
                percentageType: allOrdersPercentageData.percentageType,
            }
        };

        // Sending response
        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.log('UNABLE TO GET REVENUES AND ORDERS', error);
        res.status(500).json({ success: false, message: 'Unable to get order and revenue details' });
    }
}

//
export async function getTopSellingProduct(req, res) {
    try {
        const orders = await OrderModel.find({ status: "Approved" }).lean();
        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "No approved orders found",
            });
        }

        const allProductIds = [];
        const bookProductIds = [];

        orders.forEach((order) => {
            order.items?.forEach((item) => {
                if (item.productId) allProductIds.push(item.productId);
                if (item.productForm === "book") bookProductIds.push(item.productId);
            });
        });

        const getTopOccurrences = (arr) => {
            const counts = arr.reduce((acc, id) => {
                acc[id] = (acc[id] || 0) + 1;
                return acc;
            }, {});

            return Object.entries(counts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([id]) => id);
        };

        const topProductIds = getTopOccurrences(allProductIds);
        const topBookProductIds = getTopOccurrences(bookProductIds);

        const topSellingProducts = await ProductModel.find({
            productId: { $in: topProductIds },
        }).lean();

        const topSellingBooks = await ProductModel.find({
            productId: { $in: topBookProductIds },
        }).lean();

        console.log("Response Payload:", { topSellingProducts, topSellingBooks });
        const responsePayload = await { topSellingProducts, topSellingBooks }
        console.log("Sending Response Payload:", JSON.stringify(responsePayload, null, 2));
        res.status(200).json({
            success: true,
            data: responsePayload
        });
    } catch (error) {
        console.log("UNABLE TO GET TOP SELLING PRODUCT", error);
        res.status(500).json({
            success: false,
            data: "Unable to get top selling product",
        });
    }
}
