# KashCraft API Documentation

## Overview

This document outlines all API endpoints implemented for the KashCraft e-commerce platform. All endpoints return JSON responses and include proper error handling.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Some endpoints require authentication. Authentication is handled via JWT tokens in HTTP-only cookies.

---

## Products

### Get All Products

```
GET /products
```

**Query Parameters:**

- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 12)
- `sort` (string) - Sort by: newest, price-low, price-high, rating, popular
- `categoryId` (string) - Filter by category ID
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `search` (string) - Search query

**Response:**

```json
{
  "data": [
    {
      "id": "1",
      "name": "Product Name",
      "price": 99.99,
      "rating": 4.5,
      "stockQuantity": 10
    }
  ],
  "totalPages": 5,
  "total": 60
}
```

### Get Featured Products

```
GET /products/featured
```

**Query Parameters:**

- `limit` (number) - Number of products to return (default: 4)

**Response:**

```json
{
  "data": [...]
}
```

### Get Product by ID

```
GET /products/{id}
```

**Response:**

```json
{
  "data": {
    "id": "1",
    "name": "Product Name",
    "description": "Full description",
    "price": 99.99,
    "image": "/image.jpg",
    "images": ["/img1.jpg", "/img2.jpg"],
    "rating": 4.5,
    "reviewCount": 10,
    "stockQuantity": 10,
    "category": {...},
    "material": "Wool",
    "origin": "Kashmir",
    "weight": "2.5kg"
  }
}
```

### Get Product Reviews

```
GET /products/{id}/reviews
```

**Query Parameters:**

- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)

**Response:**

```json
{
  "data": [
    {
      "id": "1",
      "author": "John Doe",
      "rating": 5,
      "text": "Great product!",
      "date": "2025-01-15",
      "helpful": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3
  }
}
```

### Create Product Review

```
POST /products/{id}/reviews
```

**Request Body:**

```json
{
  "author": "John Doe",
  "rating": 5,
  "text": "Great product!"
}
```

---

## Categories

### Get All Categories

```
GET /categories
```

**Query Parameters:**

- `limit` (number) - Limit results

**Response:**

```json
{
  "data": [
    {
      "id": "1",
      "name": "Home Decor",
      "slug": "home-decor",
      "description": "Beautiful home decoration items"
    }
  ]
}
```

### Get Category by Slug

```
GET /categories/{slug}
```

**Response:**

```json
{
  "data": {
    "id": "1",
    "name": "Home Decor",
    "slug": "home-decor",
    "description": "Description",
    "image": "/image.jpg",
    "subcategories": [...]
  }
}
```

---

## Shopping Cart

### Get Cart

```
GET /cart
```

**Response:**

```json
{
  "data": {
    "items": [
      {
        "productId": "1",
        "name": "Product Name",
        "price": 99.99,
        "quantity": 2
      }
    ],
    "total": 199.98
  }
}
```

### Add to Cart

```
POST /cart
```

**Request Body:**

```json
{
  "productId": "1",
  "quantity": 1,
  "price": 99.99,
  "name": "Product Name"
}
```

**Response:**

```json
{
  "message": "Item added to cart",
  "data": {
    "items": [...],
    "total": 199.98
  }
}
```

### Update Cart Items

```
PATCH /cart/items
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "1",
      "quantity": 2,
      "price": 99.99
    }
  ]
}
```

### Remove Item from Cart

```
DELETE /cart/items
```

**Request Body:**

```json
{
  "productId": "1"
}
```

### Clear Cart

```
DELETE /cart
```

---

## Coupons

### Validate Coupon

```
POST /coupons/validate
```

**Request Body:**

```json
{
  "code": "SAVE10",
  "amount": 150.0
}
```

**Response:**

```json
{
  "valid": true,
  "data": {
    "code": "SAVE10",
    "discount": 10,
    "type": "percentage",
    "discountAmount": 15.0
  }
}
```

---

## Orders & Checkout

### Create Order

```
POST /orders
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "1",
      "name": "Product",
      "price": 99.99,
      "quantity": 2
    }
  ],
  "shippingData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-0000",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "paymentData": {
    "cardNumber": "4111111111111111",
    "cardholder": "John Doe",
    "expiry": "12/25",
    "cvv": "123"
  },
  "shippingMethod": "express",
  "subtotal": 199.98,
  "tax": 16.0,
  "shipping": 15.0,
  "total": 230.98,
  "coupon": "SAVE10"
}
```

**Response:**

```json
{
  "message": "Order created successfully",
  "data": {
    "id": "ORD-123456789",
    "orderNumber": "#ORD-123456789",
    "status": "PENDING",
    "date": "2025-01-20",
    "items": [...],
    "total": 230.98
  }
}
```

### Get Orders

```
GET /orders?id={orderId}
```

---

## Authentication

### Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response:**

```json
{
  "message": "Login successful",
  "data": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "555-0000",
    "token": "jwt-token"
  }
}
```

### Register

```
POST /auth/register
```

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "newuser@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**

```json
{
  "message": "Registration successful. Please verify your email.",
  "data": {
    "id": "2",
    "email": "newuser@example.com",
    "name": "John Doe"
  }
}
```

### Logout

```
POST /auth/logout
```

---

## User Account

### Get User Profile

```
GET /user/profile
```

**Response:**

```json
{
  "data": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-0000"
  }
}
```

### Get User Orders

```
GET /user/orders
```

**Response:**

```json
{
  "data": [
    {
      "id": "1001",
      "orderNumber": "#ORD-001",
      "date": "2025-01-20",
      "status": "DELIVERED",
      "items": [...],
      "total": 230.98
    }
  ],
  "total": 3
}
```

### Get User Addresses

```
GET /user/addresses
```

**Response:**

```json
{
  "data": [
    {
      "id": "1",
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US",
      "default": true
    }
  ]
}
```

### Add Address

```
POST /user/addresses
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "US",
  "default": true
}
```

---

## Wishlist

### Get Wishlist

```
GET /wishlist
```

**Response:**

```json
{
  "data": [
    {
      "productId": "1",
      "name": "Product Name",
      "price": 99.99,
      "image": "/image.jpg"
    }
  ]
}
```

### Add to Wishlist

```
POST /wishlist
```

**Request Body:**

```json
{
  "productId": "1"
}
```

### Remove from Wishlist

```
DELETE /wishlist
```

**Request Body:**

```json
{
  "productId": "1"
}
```

---

## Search

### Search Products

```
GET /search?q={query}
```

**Response:**

```json
{
  "data": [
    {
      "id": "1",
      "name": "Product Name",
      "price": 99.99,
      "image": "/image.jpg"
    }
  ],
  "count": 5,
  "query": "carpet"
}
```

---

## Contact

### Send Contact Message

```
POST /contact
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have a question about your products..."
}
```

**Response:**

```json
{
  "message": "Message sent successfully. We will get back to you soon."
}
```

---

## Analytics

### Track Event

```
POST /track
```

**Request Body:**

```json
{
  "eventType": "add_to_cart",
  "productId": "1",
  "userId": "user-123"
}
```

---

## Error Responses

All endpoints follow this error response format:

```json
{
  "error": "Error message describing what went wrong",
  "status": 400
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., Email already exists)
- `500` - Internal Server Error

---

## Rate Limiting

Endpoints are subject to rate limiting to prevent abuse:

- Default: 100 requests per minute per IP
- Auth endpoints: 5 requests per minute per IP

---

## Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Admin dashboard APIs
- [ ] Inventory management
- [ ] Advanced analytics
- [ ] Recommendation engine
- [ ] Review moderation
- [ ] Refund/return management
