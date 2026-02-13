# API Reference

This document details the REST API endpoints available in the CommerceX platform.

## Global Conventions
- **Base URL**: `http://localhost:8000` (via API Gateway) or individual service ports.
- **Content-Type**: `application/json`
- **Rate Limit**: 100 requests per 15 minutes per IP.

---

## 👤 User Service
**Port**: `3001`
**Gateway Path**: `/users` (proxies to root of User Service)

### 1. Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Create a new user account.
- **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "strongpassword",
    "role": "customer" // optional, default: customer
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "_id": "65c...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "token": "eyJhbG..."
  }
  ```

### 2. Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate and receive a JWT.
- **Payload**:
  ```json
  {
    "email": "jane@example.com",
    "password": "strongpassword"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "_id": "65c...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "token": "eyJhbG..."
  }
  ```

### 3. Get Profile
- **Endpoint**: `GET /users/profile`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response**: `200 OK`
  ```json
  {
    "_id": "65c...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer"
  }
  ```

---

## 📦 Product Service
**Port**: `3002`

### 1. Create Product
- **Endpoint**: `POST /products`
- **Payload**:
  ```json
  {
    "name": "MacBook Pro",
    "description": "M3 Chip",
    "price": 1999,
    "stock": 10,
    "category": "Laptops"
  }
  ```
- **Response**: `201 Created`

### 2. List Products
- **Endpoint**: `GET /products`
- **Description**: Retrieves products. Uses Read-Aside Caching (Redis).
- **Response**: `200 OK`
  ```json
  [
    {
      "_id": "...",
      "name": "MacBook Pro",
      "price": 1999
    }
  ]
  ```

---

## 🛒 Order Service
**Port**: `3003`

### 1. Create Order
- **Endpoint**: `POST /orders`
- **Payload**:
  ```json
  {
    "user": "<USER_ID>",
    "items": [
      {
        "product": "<PRODUCT_ID>",
        "name": "MacBook Pro",
        "quantity": 1,
        "price": 1999
      }
    ],
    "totalAmount": 1999
  }
  ```
- **Description**: Creates order with `PENDING` status and publishes `order-created` event.
- **Response**: `201 Created`

---

## 🩺 System Health
All services expose a health check endpoint.

- `GET /health`
- **Response**:
  ```json
  {
    "status": "UP",
    "service": "service-name",
    "db": "CONNECTED" // if applicable
  }
  ```
