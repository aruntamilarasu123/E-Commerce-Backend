// controllers/PaymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const CartModel = require('../models/Cart');
const ProductModel = require('../models/ProductModel');
const OrderModel = require('../models/OrderModel');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//Return public key to client
async function getKey(req, res) {
  return res.json({ key: process.env.RAZORPAY_KEY_ID });
}

//Create Razorpay order using server-side cart total
async function createRazorpayOrder(req, res) {
  try {
    const cart = await CartModel.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const totalAmount = cart.items.reduce(
      (sum, it) => sum + (it.product.price * it.quantity), 0
    );

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({ success: true, order, amount: totalAmount });
  } catch (e) {
    console.error('createRazorpayOrder error:', e);
    res.status(500).json({ success: false, message: 'Could not create payment order' });
  }
}

//Verify payment signature and place order + update stock + clear cart
async function verifyRazorpayPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Build order from cart
    const cart = await CartModel.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const items = cart.items.map((c) => ({
      product: c.product._id,
      quantity: c.quantity,
      price: c.product.price
    }));
    const totalAmount = items.reduce((s, it) => s + it.price * it.quantity, 0);

    const order = new OrderModel({
      buyer: req.user.userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    // Decrement stock
    for (const c of cart.items) {
      await ProductModel.findByIdAndUpdate(c.product._id, { $inc: { stock: -c.quantity } });
    }

    cart.items = [];
    await cart.save();
    await order.save();

    res.json({ success: true, message: 'Payment verified & order placed', order });
  } catch (e) {
    console.error('verifyRazorpayPayment error:', e);
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
}

module.exports = { getKey, createRazorpayOrder, verifyRazorpayPayment };
