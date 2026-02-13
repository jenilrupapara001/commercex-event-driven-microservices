# Event Schema Reference

CommerceX is an event-driven architecture. Services communicate asynchronously using **Apache Kafka**.

## 📨 Topics

| Topic Name | Producer | Consumers | Description |
| :--- | :--- | :--- | :--- |
| `order-created` | Order Service | Payment Service | Fired when a new order is placed. |
| `payment-completed` | Payment Service | Inventory Service, Notification Service | Fired when payment is successfully processed. |

---

## 📄 Event Payloads

### 1. Topic: `order-created`
**Source**: `order-service`
**Trigger**: `POST /orders`

**Payload Structure**:
```json
{
  "orderId": "65c3...",
  "userId": "65c1...",
  "items": [
    {
      "product": "65c2...",
      "name": "Product Name",
      "quantity": 2,
      "price": 50
    }
  ],
  "totalAmount": 100,
  "createdAt": "2024-02-13T10:00:00.000Z"
}
```

### 2. Topic: `payment-completed`
**Source**: `payment-service`
**Trigger**: Successfully processing `order-created`.

**Payload Structure**:
```json
{
  "orderId": "65c3...",
  "paymentId": "pay_12345",
  "status": "SUCCESS",
  "amount": 100,
  "processedAt": "2024-02-13T10:00:05.000Z"
}
```
*Note: If payment fails, the status would be `FAILED` (logic can be extended to handle compensation transactions).*

---

## 🔄 Event Flow

1. **User** places order via API.
2. **Order Service** saves order (Status: `PENDING`) $\rightarrow$ Publishes to `order-created`.
3. **Payment Service** consumes `order-created` $\rightarrow$ Processes Payment $\rightarrow$ Publishes `payment-completed`.
4. **Inventory Service** consumes `payment-completed` $\rightarrow$ Deducts Stock.
5. **Notification Service** consumes `payment-completed` $\rightarrow$ Sends Email.

This flow ensures that heavy processing (payment, stock, email) happens asynchronously, keeping the user experience snappy.
