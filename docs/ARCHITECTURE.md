# System Architecture

## Overview
CommerceX follows a **Microservices Architecture** pattern. Each domain (User, Product, Order, etc.) is isolated in its own service, possessing its own database (Database-per-Service pattern). Communication is handling primarily through **REST** for client-facing operations and **Kafka Events** for inter-service signaling.

## 🏗️ Core Components

### 1. API Gateway (Port 8000)
- **Role**: Reverse Proxy / Facade.
- **Tech**: Node.js, Express.
- **Function**: Routes traffic to appropriate internal microservices. Currently a simple pass-through, but acts as a placeholder for centralized Authentication, Rate Limiting, and Analytics.

### 2. User Service (User Domain)
- **Database**: MongoDB (`user-db`).
- **Auth**: JWT-based stateless authentication.
- **Security**: Passwords hashed with `bcrypt`.

### 3. Product Service (Catalog Domain)
- **Database**: MongoDB (`product-db`).
- **Caching**: Redis. Implements **Read-Aside** caching strategy.
    - *Read*: Check Redis $\rightarrow$ If Miss, Check DB $\rightarrow$ Write to Redis.
    - *Write*: Update DB $\rightarrow$ Invalidate Redis Cache.

### 4. Order Service (Sales Domain)
- **Database**: MongoDB (`order-db`).
- **Role**: Source of Truth for Orders.
- **Pattern**: Event Sourcing (Lite). It does not purely store events but triggers the core business flow via `order-created`.

### 5. Payment Service (Financial Domain)
- **Database**: MongoDB (`payment-db`).
- **Role**: Processes payments.
- **Isolation**: Listens to Kafka; does not expose a public API for payment processing (security best practice).

### 6. Inventory Service (Logistics Domain)
- **Role**: Manages Stock.
- **Trigger**: Only deducts stock after Payment is confirmed (`payment-completed`).

### 7. Notification Service (Communication Domain)
- **Role**: Sends transactional emails.
- **Trigger**: Reacts to downstream events.

## 🛡️ Security Features
- **Helmet**: Secures HTTP headers (XSS Filter, No-Sniff, etc.).
- **Rate Limiting**: `express-rate-limit` prevents DDoS/Abuse.
- **Environment Variables**: Sensitive keys (JWT Secrets, DB URIs) are managed via `.env` (simulated defaults for this demo).

## 📊 Observability
- **Logging**: Common `winston` logger format across all services.
- **Health Checks**: Standardized `/health` endpoint checking DB/dependency connectivity.
