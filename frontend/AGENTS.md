# 🧠 Frontend Agents – Bill Tracker Dashboard

This file documents reactive and UI-driven logic that works like "agents" on the frontend.

---

## 1. Auto-Renew Notification Agent

**Purpose:**  
When a new subscription bill is generated via auto-renewal, show a toast to the user.

**Trigger:**  
- After a POST triggered by auto-renew logic
- Message: `"New bill generated via auto-renew"`

**Component:**  
- Dashboard.vue or related component

---

## 2. UI Status + Totals Agent

**Purpose:**  
Automatically updates totals for:
- Paid
- Pending
- Overdue

**Trigger:**  
- On bill load or change
- Values are shown at the top of the dashboard

---

## 3. Analytics Data Generator

**Purpose:**  
Prepares data for pie and bar charts:
- Expenses by category
- Expenses by month

**Location:**  
- `AnalyticsView.vue` or composable
- Uses filtered and aggregated data from `bills`

---

> These frontend agents are reactive (computed or watcher-based) and run automatically based on state changes.
