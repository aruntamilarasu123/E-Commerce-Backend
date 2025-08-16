const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CartModel = require('../models/Cart');
const ProductModel = require('../models/ProductModel');

// Get cart
async function getCart(req, res, next){
  try {
    const cart = await CartModel.findOne({ user: req.user.userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to cart
async function addToCart(req, res, next){
  try {
    const { productId, quantity } = req.body;
    
    // Validate product
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create cart
    let cart = await CartModel.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new CartModel({ user: req.user.userId, items: [] });
    }
    
    // Check if product already in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error:error.message });
  }
};

// Update Cart
async function updateCart(req, res, next) {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Quantity must be a number' });
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await CartModel.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (!existingItem) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      existingItem.quantity = quantity;
    }

    await cart.save();

    // ✅ Re-fetch the updated cart and populate products
    const populatedCart = await CartModel.findOne({ user: req.user.userId })
      .populate('items.product');

    return res.json(populatedCart);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Remove from cart
async function removeFromCart(req, res, next){
  try {
    const cart = await CartModel.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => 
      item.product.toString() !== req.params.productId
    );
    
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    getCart,
    addToCart,
    updateCart,
    removeFromCart
};