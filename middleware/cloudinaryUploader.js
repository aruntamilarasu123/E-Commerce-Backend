const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
  },
});

const upload = multer({ storage });

module.exports = upload;
