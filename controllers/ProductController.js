const ProductModel = require("../models/ProductModel");
const cloudinary = require('../config/cloudinary');
const mongoose = require("mongoose");

// Get all products with optional search, filter, sort, pagination
async function getAllProduct(req, res) {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await ProductModel.find(query)
      .populate('seller', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductModel.countDocuments(query);

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Get single product by ID safely
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await ProductModel.findById(id)
      .populate({ path: "seller", select: "name email" }) // safer populate
      .lean(); // return plain object

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error in getProductById:", error); // 👈 log full error in backend console
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Seller creates product
async function createProduct(req, res) {
  try {
    const { name, description, price, category, stock } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
    }

    const imagePaths = files.map(file => ({
      url: file.path,
      public_id: file.filename,
    }));

    const product = new ProductModel({
      name,
      description,
      price,
      category,
      stock,
      images: imagePaths,
      seller: req.user.userId,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Seller updates product
async function updateProduct(req, res) {
  try {
    const product = await ProductModel.findOne({ _id: req.params.id, seller: req.user.userId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete existing images from Cloudinary
    if (req.files && req.files.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      const newImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));

      req.body.images = newImages;
    }

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      req.body,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Seller deletes product
async function deleteProduct(req, res) {
  try {
    const product = await ProductModel.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.userId,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Buyer adds or updates review
async function addOrUpdateReview(req, res) {
  try {
    const { rating, comment } = req.body;

    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingReviewIndex = product.reviews.findIndex(
      (r) => r.user.toString() === req.user.userId
    );

    let review;
    if (existingReviewIndex >= 0) {
      // ✅ Update existing review
      product.reviews[existingReviewIndex].rating = Number(rating);
      product.reviews[existingReviewIndex].comment = comment;
      product.reviews[existingReviewIndex].updatedAt = new Date();
      review = product.reviews[existingReviewIndex];
    } else {
      // ✅ Add new review
      review = {
        user: req.user.userId,
        name: req.user.name || "Anonymous",
        rating: Number(rating),
        comment,
        createdAt: new Date(),
      };
      product.reviews.push(review);
    }

    // Update stats
    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      message: existingReviewIndex >= 0 ? "Review updated successfully" : "Review added successfully",
      review,
      averageRating: product.averageRating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}


module.exports = {
  getAllProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addOrUpdateReview
};
