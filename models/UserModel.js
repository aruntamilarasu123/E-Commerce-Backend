const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Address sub-schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  postalCode: { type: String, required: false },
  country: { type: String, required: false, default: 'USA' }
}, { _id: false });

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email address'],
    unique: true
  },
  password: { type: String, required: true },

  phone: { type: String, required: false },
  address: addressSchema,

  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },

  // For sellers
  shopName: { type: String, required: function() { return this.role === 'seller'; } },
  shopDescription: { type: String },

  // For both
  profilePicture: { type: String }, // URL to image
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },

    // Wishlist (only used by buyers)
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Clean output (remove password, __v)
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
