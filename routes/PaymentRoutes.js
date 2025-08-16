const express = require('express');
const auth = require('../middleware/auth');
const { getKey, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/PaymentController');

const PaymentRouter = express.Router();
PaymentRouter.get('/key', auth('buyer'), getKey);
PaymentRouter.post('/create', auth('buyer'), createRazorpayOrder);
PaymentRouter.post('/verify', auth('buyer'), verifyRazorpayPayment);

module.exports = PaymentRouter;
