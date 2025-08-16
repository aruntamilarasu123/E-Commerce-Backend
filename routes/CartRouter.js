const auth = require("../middleware/auth")
const { getCart, addToCart, removeFromCart, updateCart } = require("../controllers/CartController");

// Create a router
const CartRouter = require('express').Router();

// Sub -routes

// GET Request - Get cart
CartRouter.get("/", auth('buyer'), getCart);

// POST Request - Add to cart
CartRouter.post("/", auth('buyer'), addToCart);

// PUT Request - Update to Cart
CartRouter.put("/:productId", auth('buyer'), updateCart)

// DELETE Request - Remove from cart
CartRouter.delete("/:productId", auth('buyer'), removeFromCart);

// Exports Auth Router
module.exports = {
    CartRouter
}