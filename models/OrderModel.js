const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },

  // NEW
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'online'], 
    required: true 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },

  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  cancelledBy: {
    type: String,
    enum: ['buyer', 'seller', null],
    default: null
  },

  shippingAddress: { type: String, required: true },
}, { timestamps: true });

const OrderModel = mongoose.model("Order", orderSchema);
module.exports = OrderModel;
