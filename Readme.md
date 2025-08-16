# E-Commerce Backend

A complete **Node.js + Express + MongoDB** backend for an e-commerce platform with user authentication, product management, cart, orders, payment integration (Razorpay), and wishlist functionality.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [API Routes](#api-routes)

  * [Auth](#auth)
  * [Products](#products)
  * [Cart](#cart)
  * [Orders](#orders)
  * [Payments](#payments)
* [License](#license)

---

## Features

* User authentication (buyer & seller)
* Profile management & password reset
* Product CRUD for sellers
* Product search, filter, sort, and pagination
* Reviews & ratings
* Shopping cart for buyers
* Order placement and management
* COD & online payments with Razorpay
* Wishlist management
* Cloudinary integration for product images
* Email notifications for password reset

---

## Tech Stack

* **Backend:** Node.js, Express
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT
* **Payment:** Razorpay
* **File Storage:** Cloudinary
* **Email:** Nodemailer
* **Other:** Multer, dotenv, cors

---

## Getting Started

1. **Clone the repository**

```bash
git clone <repo-url>
cd ecommerce-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file** in the root directory

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

4. **Run the server**

```bash
npm run start
```

Server will start on `http://localhost:5000`

---

## API Routes

### Auth

| Method | Route                         | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| POST   | `/auth/register`              | Signup                       |
| POST   | `/auth/login`                 | Login                        |
| POST   | `/auth/change-password`       | Change password              |
| POST   | `/auth/forgot-password`       | Request password reset       |
| POST   | `/auth/reset-password/:token` | Reset password               |
| GET    | `/auth/buyer/profile`         | Get buyer profile            |
| PUT    | `/auth/buyer/profile`         | Update buyer profile         |
| GET    | `/auth/seller/profile`        | Get seller profile           |
| PUT    | `/auth/seller/profile`        | Update seller profile        |
| POST   | `/auth/wishlist`              | Add product to wishlist      |
| GET    | `/auth/wishlist`              | Get wishlist                 |
| DELETE | `/auth/wishlist/:productId`   | Remove product from wishlist |

---

### Products

| Method | Route                  | Description                                         |
| ------ | ---------------------- | --------------------------------------------------- |
| GET    | `/products`            | Get all products (search, filter, sort, pagination) |
| GET    | `/products/:id`        | Get single product                                  |
| POST   | `/products`            | Create product (seller)                             |
| PUT    | `/products/:id`        | Update product (seller)                             |
| DELETE | `/products/:id`        | Delete product (seller)                             |
| POST   | `/products/:id/review` | Add/update review (buyer)                           |

---

### Cart

| Method | Route              | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | `/cart`            | Get user's cart          |
| POST   | `/cart`            | Add product to cart      |
| PUT    | `/cart/:productId` | Update product quantity  |
| DELETE | `/cart/:productId` | Remove product from cart |

---

### Orders

| Method | Route                   | Description                     |
| ------ | ----------------------- | ------------------------------- |
| POST   | `/orders`               | Buyer places order              |
| GET    | `/orders/buyer`         | Get buyer's orders              |
| GET    | `/orders/seller`        | Get seller's orders             |
| PUT    | `/orders/:id/status`    | Update order status (seller)    |
| PUT    | `/orders/buyer/:id`     | Cancel buyer order              |
| PUT    | `/orders/seller/:id`    | Cancel seller order             |
| PATCH  | `/orders/:id/mark-paid` | Mark COD order as paid (seller) |

---

### Payments (Razorpay)

| Method | Route              | Description                  |
| ------ | ------------------ | ---------------------------- |
| GET    | `/payments/key`    | Get Razorpay public key      |
| POST   | `/payments/create` | Create Razorpay order        |
| POST   | `/payments/verify` | Verify payment & place order |

---

## License

MIT © Arun T
