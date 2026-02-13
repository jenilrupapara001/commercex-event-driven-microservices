const Order = require('../models/order.model');
const { publishMessage, TOPICS } = require('shared-lib');

// @desc    Create new order
// @route   POST /orders
// @access  Private (Needs Auth Middleware in real app, simulating user for now)
const createOrder = async (req, res) => {
    try {
        const { user, items, totalAmount } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }

        const order = new Order({
            user,
            items,
            totalAmount,
            status: 'PENDING'
        });

        const createdOrder = await order.save();

        // Publish Order Created Event
        const eventPayload = {
            orderId: createdOrder._id,
            userId: user,
            items: items,
            totalAmount: totalAmount,
            createdAt: createdOrder.createdAt
        };

        await publishMessage(TOPICS.ORDER_CREATED, eventPayload);

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders };
