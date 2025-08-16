const auth = require("../middleware/auth");
const { buyerPlacesOrder, getBuyerOrder, getSellerOrder, updateOrderStatusSeller, cancelBuyerOrder, cancelSellerOrder, markCodOrderPaid } = require('../controllers/OrderController');

// Create a router
const OrderRouter = require('express').Router();

// Sub -routes

// POST Request - Buyer places order
OrderRouter.post("/", auth('buyer'), buyerPlacesOrder);

// GET Request - Get buyer's orders
OrderRouter.get("/buyer", auth('buyer'), getBuyerOrder);

// GET Request - Get seller's orders
OrderRouter.get("/seller", auth('seller'), getSellerOrder);

// PUT Request - Update order status (seller)
OrderRouter.put("/:id/status", auth('seller'), updateOrderStatusSeller)

// Cancel orders buyer
OrderRouter.put('/buyer/:id', auth('buyer'), cancelBuyerOrder);

// Cancel orders seller
OrderRouter.put('/seller/:id', auth('seller'), cancelSellerOrder);

// Seller/admin marks COD order as paid
OrderRouter.patch('/:id/mark-paid', auth('seller'), markCodOrderPaid);

// Exports RecipesRouter
module.exports = {
    OrderRouter
}