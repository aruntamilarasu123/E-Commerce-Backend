const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const cors = require('cors');
const { AuthRouter } = require('./routes/AuthRouter');
const { ProductRouter } = require('./routes/ProductRouter');
const { OrderRouter } = require('./routes/OrderRouter');
const { CartRouter } = require('./routes/CartRouter');
const PaymentRouter = require('./routes/PaymentRoutes');

// DB connection
dotenv.config();
connectDB();

// Create a server
const HTTP_Server = express();

// Enable Cors
HTTP_Server.use(cors())
// HTTP_Server.use(cors({
//   origin: 'https://e-commerce-frontend-1oqq.onrender.com', // must NOT be '*'
//   credentials: true,               // allow cookies/auth headers
// }));


// Middleware
HTTP_Server.use(express.json())

// Start Server
const PORT = process.env.PORT || 5000;

HTTP_Server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Router
HTTP_Server.use("/auth", AuthRouter)
HTTP_Server.use("/products", ProductRouter)
HTTP_Server.use("/orders", OrderRouter)
HTTP_Server.use("/cart", CartRouter)
HTTP_Server.use('/payments', PaymentRouter);
HTTP_Server.use('/uploads', express.static(path.join(__dirname, 'uploads')));
HTTP_Server.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Commerce API Documentation</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-800">

  <div class="p-8 max-w-6xl mx-auto">
    <h1 class="text-4xl font-bold mb-6">E-Commerce API Documentation</h1>

    <!-- Auth Section -->
    <div class="mb-6 border rounded-lg shadow-sm">
      <button class="w-full text-left px-4 py-3 font-semibold text-lg bg-gray-100 hover:bg-gray-200 flex justify-between items-center" onclick="toggleSection('auth')">
        Auth <span id="toggle-auth">+</span>
      </button>
      <div id="section-auth" class="p-4 bg-white hidden">
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="border px-4 py-2 text-left">Method</th>
              <th class="border px-4 py-2 text-left">Route</th>
              <th class="border px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/auth/register</td><td class="border px-4 py-2">Signup</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/auth/login</td><td class="border px-4 py-2">Login</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/auth/change-password</td><td class="border px-4 py-2">Change password</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/auth/forgot-password</td><td class="border px-4 py-2">Request password reset</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/auth/reset-password/:token</td><td class="border px-4 py-2">Reset password</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/auth/buyer/profile</td><td class="border px-4 py-2">Get buyer profile</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-yellow-600">PUT</td><td class="border px-4 py-2 font-mono">/auth/buyer/profile</td><td class="border px-4 py-2">Update buyer profile</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/auth/seller/profile</td><td class="border px-4 py-2">Get seller profile</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-yellow-600">PUT</td><td class="border px-4 py-2 font-mono">/auth/seller/profile</td><td class="border px-4 py-2">Update seller profile</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/auth/wishlist</td><td class="border px-4 py-2">Add product to wishlist</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/auth/wishlist</td><td class="border px-4 py-2">Get wishlist</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-red-600">DELETE</td><td class="border px-4 py-2 font-mono">/auth/wishlist/:productId</td><td class="border px-4 py-2">Remove product from wishlist</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Products Section -->
    <div class="mb-6 border rounded-lg shadow-sm">
      <button class="w-full text-left px-4 py-3 font-semibold text-lg bg-gray-100 hover:bg-gray-200 flex justify-between items-center" onclick="toggleSection('products')">
        Products <span id="toggle-products">+</span>
      </button>
      <div id="section-products" class="p-4 bg-white hidden">
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="border px-4 py-2 text-left">Method</th>
              <th class="border px-4 py-2 text-left">Route</th>
              <th class="border px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/products</td><td class="border px-4 py-2">Get all products (search, filter, sort, pagination)</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/products/:id</td><td class="border px-4 py-2">Get single product</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/products</td><td class="border px-4 py-2">Create product (seller)</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-yellow-600">PUT</td><td class="border px-4 py-2 font-mono">/products/:id</td><td class="border px-4 py-2">Update product (seller)</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-red-600">DELETE</td><td class="border px-4 py-2 font-mono">/products/:id</td><td class="border px-4 py-2">Delete product (seller)</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-purple-600">POST</td><td class="border px-4 py-2 font-mono">/products/:id/review</td><td class="border px-4 py-2">Add/update review (buyer)</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cart Section -->
    <div class="mb-6 border rounded-lg shadow-sm">
      <button class="w-full text-left px-4 py-3 font-semibold text-lg bg-gray-100 hover:bg-gray-200 flex justify-between items-center" onclick="toggleSection('cart')">
        Cart <span id="toggle-cart">+</span>
      </button>
      <div id="section-cart" class="p-4 bg-white hidden">
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="border px-4 py-2 text-left">Method</th>
              <th class="border px-4 py-2 text-left">Route</th>
              <th class="border px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/cart</td><td class="border px-4 py-2">Get user's cart</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/cart</td><td class="border px-4 py-2">Add product to cart</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-yellow-600">PUT</td><td class="border px-4 py-2 font-mono">/cart/:productId</td><td class="border px-4 py-2">Update product quantity</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-red-600">DELETE</td><td class="border px-4 py-2 font-mono">/cart/:productId</td><td class="border px-4 py-2">Remove product from cart</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Orders Section -->
    <div class="mb-6 border rounded-lg shadow-sm">
      <button class="w-full text-left px-4 py-3 font-semibold text-lg bg-gray-100 hover:bg-gray-200 flex justify-between items-center" onclick="toggleSection('orders')">
        Orders <span id="toggle-orders">+</span>
      </button>
      <div id="section-orders" class="p-4 bg-white hidden">
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="border px-4 py-2 text-left">Method</th>
              <th class="border px-4 py-2 text-left">Route</th>
              <th class="border px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/orders</td><td class="border px-4 py-2">Buyer places order</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/orders/buyer</td><td class="border px-4 py-2">Get buyer's orders</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/orders/seller</td><td class="border px-4 py-2">Get seller's orders</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-yellow-600">PUT</td><td class="border px-4 py-2 font-mono">/orders/:id/status</td><td class="border px-4 py-2">Update order status (seller)</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-red-600">PUT</td><td class="border px-4 py-2 font-mono">/orders/buyer/:id</td><td class="border px-4 py-2">Cancel buyer order</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-red-600">PUT</td><td class="border px-4 py-2 font-mono">/orders/seller/:id</td><td class="border px-4 py-2">Cancel seller order</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-purple-600">PATCH</td><td class="border px-4 py-2 font-mono">/orders/:id/mark-paid</td><td class="border px-4 py-2">Mark COD order as paid (seller)</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payments Section -->
    <div class="mb-6 border rounded-lg shadow-sm">
      <button class="w-full text-left px-4 py-3 font-semibold text-lg bg-gray-100 hover:bg-gray-200 flex justify-between items-center" onclick="toggleSection('payments')">
        Payments <span id="toggle-payments">+</span>
      </button>
      <div id="section-payments" class="p-4 bg-white hidden">
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="border px-4 py-2 text-left">Method</th>
              <th class="border px-4 py-2 text-left">Route</th>
              <th class="border px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-green-600">GET</td><td class="border px-4 py-2 font-mono">/payments/key</td><td class="border px-4 py-2">Get Razorpay public key</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-blue-600">POST</td><td class="border px-4 py-2 font-mono">/payments/create</td><td class="border px-4 py-2">Create Razorpay order</td></tr>
            <tr class="hover:bg-gray-50"><td class="border px-4 py-2 font-semibold text-purple-600">POST</td><td class="border px-4 py-2 font-mono">/payments/verify</td><td class="border px-4 py-2">Verify payment & place order</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <script>
    function toggleSection(id) {
      const section = document.getElementById('section-' + id);
      const toggle = document.getElementById('toggle-' + id);
      if(section.classList.contains('hidden')){
        section.classList.remove('hidden');
        toggle.textContent = '−';
      } else {
        section.classList.add('hidden');
        toggle.textContent = '+';
      }
    }
  </script>

</body>
</html>
`);
});

