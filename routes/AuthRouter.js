const auth = require('../middleware/auth')
const {signUp, login, changePassword, resetPassword, requestPasswordReset, getProfile, updateProfile, addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/UserController');

// Create a router
const AuthRouter = require('express').Router();

// Sub -routes

// POST Request - SignUp
AuthRouter.post("/register", signUp);

// POST Request - SignUp
AuthRouter.post("/login", login);

// POST Request - Change Password
AuthRouter.post("/change-password", auth(), changePassword);

// POST Request - Forgot Password
AuthRouter.post("/forgot-password", requestPasswordReset);

// POST Request -  Reset Password
AuthRouter.post("/reset-password/:token", resetPassword);

// Routes for Buyer
AuthRouter.get("/buyer/profile", auth('buyer'), getProfile);
AuthRouter.put("/buyer/profile", auth('buyer'), updateProfile);

// Routes for Seller
AuthRouter.get("/seller/profile", auth('seller'), getProfile);
AuthRouter.put("/seller/profile", auth('seller'), updateProfile);

 // Add to wishlist
AuthRouter.post('/wishlist', auth('buyer'), addToWishlist);

 // Get wishlist
AuthRouter.get('/wishlist', auth('buyer'), getWishlist);

 // Remove from wishlist
AuthRouter.delete('/wishlist/:productId', auth("buyer"), removeFromWishlist);

// Exports Auth Router
module.exports = {
    AuthRouter
}