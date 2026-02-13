# CommerceX – Event-Driven Microservices Platform

**CommerceX** is a scalable, event-driven e-commerce backend built with **Node.js**, **Express**, **Kafka**, **MongoDB**, and **Redis**. It demonstrates a modern microservices architecture where services communicate asynchronously via events.

---

## 📚 Documentation
- [**API Reference**](docs/API.md): Detailed API endpoints and examples.
- [**Event Schema**](docs/EVENTS.md): Kafka topics and event payload specifications.
- [**System Architecture**](docs/ARCHITECTURE.md): Deep dive into design patterns and components.
- [**Testing Guide**](docs/TESTING.md): Comprehensive testing strategy and verification steps.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    User((User)) -->|HTTP Request| Gateway[API Gateway :8000]
    Gateway -->|Proxy| UserSvc[User Service :3001]
    Gateway -->|Proxy| ProdSvc[Product Service :3002]
    Gateway -->|Proxy| OrderSvc[Order Service :3003]

    subgraph "Data Layer"
        UserDB[(User DB)]
        ProdDB[(Product DB)]
        OrderDB[(Order DB)]
        PayDB[(Payment DB)]
        Redis[(Redis Cache)]
    end

    subgraph "Event Bus"
        Kafka{Apache Kafka}
    end

    UserSvc --- UserDB
    ProdSvc --- ProdDB
    ProdSvc -.-> Redis
    OrderSvc --- OrderDB

    OrderSvc --"order-created"--> Kafka
    Kafka --"order-created"--> PaySvc[Payment Service :3004]
    
    PaySvc --- PayDB
    PaySvc --"payment-completed"--> Kafka
    
    Kafka --"payment-completed"--> InvSvc[Inventory Service :3005]
    Kafka --"payment-completed"--> NotifSvc[Notification Service :3006]
```

---

## 🚀 Services

| Service | Port | Database | Responsibilities |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `8000` | N/A | Central entry point, request routing. |
| **User Service** | `3001` | MongoDB | User auth (JWT), profile management. |
| **Product Service** | `3002` | MongoDB, Redis | Product CRUD, Read-Aside Caching. |
| **Order Service** | `3003` | MongoDB | Order placement, Event Producer. |
| **Payment Service** | `3004` | MongoDB | Payment processing, Event Consumer/Producer. |
| **Inventory Service** | `3005` | N/A (Simulated) | Stock management, Event Consumer. |
| **Notification Service** | `3006` | N/A (Simulated) | Email notifications, Event Consumer. |

---

## 🛠️ Prerequisites

- **Node.js** (v18+)
- **Docker** & **Docker Compose**
- **Git**

---

## 🏁 Getting Started

### 1. Clone & Setup
```bash
git clone <repository-url>
cd CommerceX1
```

### 2. Start Infrastructure
Run the following command to start **Zookeeper**, **Kafka**, **Redis**, and **MongoDB**:
```bash
docker-compose up -d
```
*Wait for a minute to ensure Kafka and Zookeeper perform their handshake.*

### 3. Install Dependencies & Start Services
You can run each service in a separate terminal.

**User Service:**
```bash
cd user-service && npm install && npm start
```

**Product Service:**
```bash
cd product-service && npm install && npm start
```

**Order Service:**
```bash
cd order-service && npm install && npm start
```

**Payment Service:**
```bash
cd payment-service && npm install && npm start
```

**Inventory Service:**
```bash
cd inventory-service && npm install && npm start
```

**Notification Service:**
```bash
cd notification-service && npm install && npm start
```

**API Gateway:**
```bash
cd api-gateway && npm install && npm start
```

---

## 🧪 Verification

We have included a comprehensive verification walkthrough.

1.  **Check Health**:
    ```bash
    curl http://localhost:3001/health
    # Response: {"status":"UP","service":"user-service","db":"CONNECTED"}
    ```

2.  **Test Full Flow**:
    Create an order and watch the logs of Payment, Inventory, and Notification services.
    ```bash
    curl -X POST http://localhost:3003/orders \
      -H "Content-Type: application/json" \
      -d '{"user":"<USER_ID>","items":[{"product":"<PRODUCT_ID>","quantity":1,"price":100}],"totalAmount":100}'
    ```

---

## 🔒 Security & Observability

- **Rate Limiting**: All services currently limited to 100 requests / 15 mins.
- **Security Headers**: `Helmet` is enabled on all services.
- **Logging**: Structured JSON logging via `Winston` (Method, URL, Status, Duration).

---

## 📜 License

MIT
