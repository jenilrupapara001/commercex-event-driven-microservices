# CommerceX – Complete System Testing Guide

## 1. Overview
This document provides a comprehensive testing strategy for the CommerceX Event-Driven Microservices Platform.

It covers:
- Infrastructure validation
- Service-level testing
- Authentication testing
- Kafka event flow validation
- Redis caching validation
- Security testing
- Failure scenario testing
- End-to-end workflow verification

## 2. Infrastructure Testing

### 2.1 Start Infrastructure
**Run:**
```bash
docker-compose up --build
```
**Expected:**
- Zookeeper starts successfully
- Kafka connects to Zookeeper
- All MongoDB instances start
- Redis starts
- All services start without crash loops
- No continuous retry logs

### 2.2 Container Verification
**Run:**
```bash
docker ps
```
**Verify:**
- `api-gateway` running
- `user-service` running
- `product-service` running
- `order-service` running
- `payment-service` running
- `inventory-service` running
- `notification-service` running
- `kafka` running
- `redis` running
- `mongodb` containers running

## 3. Health Check Testing
Each service must expose:
`GET /health`

**Expected Response:**
```json
{
  "status": "UP"
}
```
Test all services individually.

## 4. User Service Testing

### 4.1 Registration
**Request:**
`POST /api/users/register`

**Payload:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```
**Expected:**
- 201 Created
- Password stored hashed in DB
- No plain password visible

### 4.2 Login
**Request:**
`POST /api/users/login`

**Expected:**
- 200 OK
- JWT token returned
- Token expiry defined

### 4.3 Profile Access
**Request:**
`GET /api/users/profile`
Header: `Authorization: Bearer <token>`

**Expected:**
- 200 OK
- User data returned
- Unauthorized if token missing

## 5. Product Service Testing

### 5.1 Create Product
`POST /api/products`

**Expected:**
- 201 Created
- Product saved in MongoDB

### 5.2 Fetch Products
`GET /api/products`

**Expected:**
- First call hits DB
- Subsequent calls hit Redis cache
- Verify via logs.

### 5.3 Product Search
`GET /api/products?search=laptop`

**Expected:**
- Filtered results
- Indexed query performance

## 6. Order Service & Kafka Producer Testing

### 6.1 Create Order
`POST /api/orders`

**Expected:**
- Order saved in DB
- Kafka publishes "order-created"
- Log shows event published

## 7. Payment Service Kafka Consumer Testing
After order creation:

**Verify:**
- Payment service logs show consumption of "order-created"
- Payment processed
- "payment-completed" event published

## 8. Inventory Consumer Testing
After payment:

**Verify:**
- Inventory service logs show event consumption
- Stock reduced in MongoDB
- No negative stock allowed

## 9. Notification Consumer Testing
After payment:

**Verify:**
- Notification service logs event consumption
- Email simulation log printed

## 10. End-to-End Workflow Testing
**Full scenario:**
1. Register user
2. Login
3. Create product
4. Place order

**Verify:**
- Order saved
- Payment processed
- Inventory updated
- Notification triggered
- All services must log activity.

## 11. Redis Cache Validation
**Steps:**
1. Fetch product list
2. Verify cache entry created in Redis
3. Stop MongoDB product container
4. Fetch products again
5. Confirm response still served from Redis

## 12. Security Testing

### 12.1 JWT Validation
- Access protected route without token → 401
- Invalid token → 403
- Expired token → 401

### 12.2 Password Hashing
**Verify:**
- Password stored hashed using bcrypt
- Salt rounds applied

### 12.3 Rate Limiting
Send repeated requests quickly.
**Expected:**
- 429 Too Many Requests

### 12.4 Security Headers
Inspect response headers:
- Helmet headers present
- X-Content-Type-Options
- X-Frame-Options

## 13. Failure Scenario Testing

### 13.1 Payment Service Crash
1. Stop payment-service container
2. Create order
3. Restart payment-service

**Expected:**
- Kafka replays unprocessed events
- Payment processed after restart

### 13.2 Kafka Restart
1. Restart Kafka container
2. Verify services reconnect properly
3. No data loss

### 13.3 MongoDB Restart
1. Restart one MongoDB instance.
**Expected:**
- Only that service temporarily affected
- Other services continue working

## 14. Idempotency Validation
Trigger duplicate payment event manually.

**Expected:**
- System prevents duplicate stock deduction
- No double processing

## 15. Logging Validation
Verify logs include:
- Timestamp
- Service name
- Log level
- Correlation ID (if implemented)

## 16. Performance Testing (Basic)
**Use:** `ab` or `k6`

**Test:**
- Concurrent product listing requests
- Order creation load

**Expected:**
- No crashes
- Stable response time
- Redis reduces DB hits

## 17. Observability Validation
- All services respond to /health
- No silent failures
- Logs structured (JSON format if using Winston)

## 18. Final System Acceptance Criteria
System is considered stable when:
- All services run independently
- Kafka event flow works reliably
- Redis caching operational
- Authentication secure
- Failure recovery works
- End-to-end flow verified
- No crash loops in containers

## 19. Interview Validation Readiness
Before interview ensure you can explain:
- Event-driven architecture
- Kafka consumer groups
- Database-per-service pattern
- Horizontal scaling
- Failure recovery
- Security implementation
- Caching strategy
- Logging strategy

## 20. Final Verification Command
```bash
docker-compose down -v
docker-compose up --build
```
If system restarts cleanly and passes tests again:
**CommerceX is production-ready from architecture perspective.**
