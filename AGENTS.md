# 🤖 Backend Agents – Bill Tracker Dashboard

This file documents automated logic and backend processes ("agents") that run without direct user interaction.

---

## 1. Reminder Agent

**Purpose:**  
Checks bills every minute and logs or notifies if a bill is due in the next 3 days.

**Runs:**  
- Cron job via `node-cron`

**Location:**  
- `src/reminder.js`

---

## 2. Auto-Renew Agent

**Purpose:**  
Automatically creates a new bill for subscriptions after a payment is marked as "paid" and `autoRenew` is true.

**Trigger:**  
- On bill update → when status changes to `"paid"`

**Logic:**
- Duplicates `name`, `description`, `amount`, `category`, `paymentProvider`, `autoRenew`
- Increments `dueDate` by 1 month
- Sets status to `"pending"`

**Location:**  
- `src/services/bill.service.js`

---

## 3. Monthly Summary Agent

**Purpose:**  
Calculates totals for `paid`, `pending`, and `overdue` bills in the current month.

**Endpoint:**  
- `GET /bills/summary`

---

## 4. Overdue Status Agent

**Purpose:**
Marks bills as `"overdue"` when their due date passes and they remain unpaid.

**Runs:**
- Invoked whenever bills are listed or summaries are generated.

**Location:**
- `src/services/billService.js` (`updateOverdueBills`)

---

## 5. Payment History Agent

**Purpose:**
Automatically records a payment entry when a bill status changes to `"paid"`.

**Trigger:**
- On bill update when status transitions to `"paid"`.

**Location:**
- `src/services/billService.js`

---

> All backend agents operate on an in-memory DB (mockDB.js) and are extendable for persistence or notifications.

## 🛠 Development Notes

- No automated tests are available for this agent at the moment.
- No `npm test` or test scripts are defined for this repo.
- You may proceed with implementation without running tests.
- After implementation, create a commit and open a Pull Request with a clear title.

### Commit message suggestion:
"✨ Implemented [AgentName]: [short description]"

### Pull Request title:
"🤖 Add [AgentName] logic to [backend/frontend]"

Example:
"🤖 Add Auto-Renew Agent logic to backend"

