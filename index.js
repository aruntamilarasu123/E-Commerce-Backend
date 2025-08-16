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
    <!-- Add your collapsible tables here -->
  </div>
  <script>
    function toggleSection(id){
      const section = document.getElementById('section-'+id);
      const toggle = document.getElementById('toggle-'+id);
      if(section.classList.contains('hidden')){
        section.classList.remove('hidden'); toggle.textContent='−';
      } else { section.classList.add('hidden'); toggle.textContent='+'; }
    }
  </script>
</body>
</html>`);
});

