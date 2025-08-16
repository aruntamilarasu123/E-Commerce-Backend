const upload = require('../middleware/cloudinaryUploader');
const auth = require('../middleware/auth')
const { getAllProduct, createProduct, updateProduct, deleteProduct, getProductById, addOrUpdateReview } = require('../controllers/ProductController');

// Create a router
const ProductRouter = require('express').Router();

// Sub -routes

// GET Request -  Get all products
ProductRouter.get("/", getAllProduct);
ProductRouter.get('/:id', getProductById);

// POST Request - Seller creates product
ProductRouter.post("/", upload.array('images', 5), auth('seller'), createProduct);

// PUT Request - Seller updates product
ProductRouter.put("/:id", upload.array('images'), auth('seller'), updateProduct);

// DELETE Request - Seller deletes product
ProductRouter.delete("/:id", auth('seller'), deleteProduct);

ProductRouter.post('/:id/review', auth('buyer'), addOrUpdateReview);

// Exports RecipesRouter
module.exports = {
    ProductRouter
}