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
//   origin: 'http://localhost:5173', // must NOT be '*'
//   credentials: true,               // allow cookies/auth headers
// }));


// Middleware
HTTP_Server.use(express.json())

// Start Server
const PORT = process.env.PORT || 5000;

HTTP_Server.listen(PORT,'0.0.0.0',() => {
    try {
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.log("Server Connection Error", error)
    }
})

// Router
HTTP_Server.use("/auth", AuthRouter)
HTTP_Server.use("/products", ProductRouter)
HTTP_Server.use("/orders", OrderRouter)
HTTP_Server.use("/cart", CartRouter)
HTTP_Server.use('/payments', PaymentRouter);
HTTP_Server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

