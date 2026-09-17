# Notification channels (architecture stub)

Sprint 11 prepares notification hooks for customer order tracking. **No browser, email, or WhatsApp integrations are implemented.**

## Intended channels

| Channel  | Trigger examples                                  | Delivery target         |
| -------- | ------------------------------------------------- | ----------------------- |
| Browser  | Status change, ready for pickup                   | Same device session     |
| Email    | Payment received, ready for pickup, cancelled     | Customer email (future) |
| WhatsApp | Ready for pickup, delayed, collected confirmation | Customer phone (future) |

## Proposed event bus (future)

```text
Order status transition
  → TrackingNotificationEvent { orderId, customerStatus, channels[] }
    → BrowserPushAdapter (Web Push / Notification API)
    → EmailAdapter (transactional provider)
    → WhatsAppAdapter (Business API)
```

## Current API surface

`GET /api/tracking/orders/:id` returns:

```json
{
  "notifications": {
    "channels": ["browser", "email", "whatsapp"],
    "enabled": false,
    "note": "Notification channels are reserved for a later sprint — no messages are sent yet."
  }
}
```

The customer tracking UI renders this as a disabled stub so product copy stays honest.

## Out of scope (do not implement here)

- Collecting email / phone
- Opt-in preferences
- Provider credentials
- Actual push / SMTP / WhatsApp sends
- Auth-gated notification preferences
