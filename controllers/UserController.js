const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const UserModel = require("../models/UserModel");
const ProductModel = require('../models/ProductModel');
const mongoose = require('mongoose');

// Register (Signup)
async function signUp(req, res) {
  try {
    const { name, email, password, role, shopName, shopDescription } = req.body;

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // For sellers, enforce shopName
    if (role === "seller" && !shopName) {
      return res.status(400).json({ message: 'Shop name is required for sellers' });
    }

    const user = new UserModel({ 
      name, 
      email, 
      password, 
      role, 
      shopName: role === "seller" ? shopName : undefined,
      shopDescription: role === "seller" ? shopDescription : undefined
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ token, userId: user._id, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, userId: user._id, role: user.role, userName: user.name });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Change Password
async function changePassword(req, res) {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Request Password Reset
async function requestPasswordReset(req, res) {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click the link to reset your password: ${resetLink}`,
            html: `<p>You requested a password reset.</p>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>This link will expire in 1 hour.</p>`
        });

        res.json({ message: 'Password reset link sent to email' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Reset Password
async function resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Get Profile
async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const user = await UserModel.findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires -__v');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Update Profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    const disallowedFields = ['email', 'password', 'role', 'resetPasswordToken', 'resetPasswordExpires', '_id'];
    disallowedFields.forEach(field => delete updates[field]);

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Safely handle address update
    if (updates.address) {
      user.address = {
        ...user.address,         // handles undefined gracefully
        ...updates.address
      };
      delete updates.address;
    }

    Object.assign(user, updates);

    await user.save();

    const updatedProfile = user.toObject();
    delete updatedProfile.password;
    delete updatedProfile.resetPasswordToken;
    delete updatedProfile.resetPasswordExpires;
    delete updatedProfile.__v;

    res.json({ message: 'Profile updated successfully', profile: updatedProfile });

  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Add a product to wishlist
async function addToWishlist(req, res) {
  try {
    const userId = req.user.userId; // ✅ FIXED
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ message: 'Product added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Remove a product from wishlist
async function removeFromWishlist(req, res) {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const user = await UserModel.findById(userId);
        const index = user.wishlist.findIndex(id => id.toString() === productId);
        if (index === -1) {
            return res.status(404).json({ message: 'Product not in wishlist' });
        }

        user.wishlist.splice(index, 1);
        await user.save();

        res.json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Get user's wishlist
async function getWishlist(req, res) {
    try {
        const userId = req.user.userId;
        const user = await UserModel.findById(userId).populate('wishlist');

        res.json({ wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    signUp,
    login,
    changePassword,
    requestPasswordReset,
    resetPassword,
    getProfile,
    updateProfile,
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
