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
  res.sendFile(path.join(__dirname, 'views', 'apidocspage.html'));
});

