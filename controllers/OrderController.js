const CartModel = require('../models/Cart');
const OrderModel = require('../models/OrderModel');
const ProductModel = require('../models/ProductModel');
const express = require('express');


// Buyer places order
async function buyerPlacesOrder(req, res, next) {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    // Get cart
    const cart = await CartModel.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    // Prepare order items
    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));
    // Calculate total
    const totalAmount = items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    // Create order
    const order = new OrderModel({
      buyer: req.user.userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod, // <- from body: 'cod'
      paymentStatus: 'pending'
    });
    // Update product stock
    for (const item of cart.items) {
      await ProductModel.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }
    // Clear cart
    cart.items = [];
    await cart.save();
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get buyer's orders
async function getBuyerOrder(req, res, next) {
  try {
    const orders = await OrderModel.find({ buyer: req.user.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get seller's orders
async function getSellerOrder(req, res, next) {
  try {
    const orders = await OrderModel.find({
      'items.product': {
        $in: await ProductModel.find({ seller: req.user.userId }).distinct('_id')
      }
    })
      .populate('buyer', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (seller)
async function updateOrderStatusSeller(req, res, next) {
  try {
    const { status } = req.body;
    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel Buyer order
async function cancelBuyerOrder(req, res, next) {
  try {
    const userId = req.user.userId;

    const order = await OrderModel.findOne({
      _id: req.params.id,
      buyer: userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    // Prevent cancelling if already shipped or delivered
    const blockedStatuses = ['shipped', 'delivered', 'cancelled'];
    if (blockedStatuses.includes(order.status.toLowerCase())) {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
    }

    order.status = 'cancelled';
    order.cancelledBy = 'buyer';

    await order.save();

    res.json({
      message: 'Order cancelled successfully by buyer',
      orderId: order._id,
      status: order.status,
      cancelledBy: order.cancelledBy
    });
  } catch (error) {
    console.error('Error in cancelBuyerOrder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Seller cancels an order before it is delivered or shipped
async function cancelSellerOrder(req, res, next) {
  try {
    const userId = req.user.userId;

    const order = await OrderModel.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get product IDs owned by the seller
    const sellerProductIds = await ProductModel.find({ seller: userId }).distinct('_id');

    // Check if any product in the order belongs to the seller
    const sellerOwnsPart = order.items.some(item =>
      sellerProductIds.map(id => id.toString()).includes(item.product._id.toString())
    );

    if (!sellerOwnsPart) {
      return res.status(403).json({ message: 'Unauthorized: This order does not include your products' });
    }

    // Prevent cancelling if already shipped, delivered, or cancelled
    const blockedStatuses = ['shipped', 'delivered', 'cancelled'];
    if (blockedStatuses.includes(order.status.toLowerCase())) {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
    }

    order.status = 'cancelled';
    order.cancelledBy = 'seller';

    await order.save();

    res.json({
      message: 'Order cancelled successfully by seller',
      orderId: order._id,
      status: order.status,
      cancelledBy: order.cancelledBy
    });
  } catch (error) {
    console.error('Error in cancelSellerOrder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}


// Mark COD order as paid (seller/admin after cash collection)
async function markCodOrderPaid(req, res) {
  try {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'Only COD orders can be marked as paid this way' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already marked as paid' });
    }

    order.paymentStatus = 'paid';
    await order.save();

    res.json({ message: 'COD order marked as paid successfully', order });
  } catch (err) {
    console.error('Error in markCodOrderPaid:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


module.exports = {
  buyerPlacesOrder,
  getBuyerOrder,
  getSellerOrder,
  updateOrderStatusSeller,
  cancelBuyerOrder,
  cancelSellerOrder,
  markCodOrderPaid
};