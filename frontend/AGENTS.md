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

## 2. UI Totals Updater Agent

**Purpose:**  
Automatically updates totals for:
- Paid
- Pending
- Overdue

**Trigger:**  
- On bill load or change
- Values are shown at the top of the dashboard

---

## 3. Form Dialog Manager

**Purpose:**
Handles opening and closing of the Add and Edit bill dialogs.

**Components:**
- `BillForm.vue`
- `EditBillForm.vue`

**Logic:**
- Uses reactive `dialog` state and watchers to show or hide the modal forms.

---

## 4. Navigation Drawer Agent

**Purpose:**
Controls drawer visibility and highlights the active navigation tab based on the current route.

**Location:**
- `App.vue`

**Logic:**
- Watches display breakpoints to toggle the drawer.
- Uses `useRoute` to mark the active list item.

---

## 5. Analytics Chart Data Agent

**Purpose:**  
Prepares data for pie and bar charts:
- Expenses by category
- Expenses by month

**Location:**  
- `AnalyticsView.vue` or composable
- Uses filtered and aggregated data from `bills`

---

> These frontend agents are reactive (computed or watcher-based) and run automatically based on state changes.

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

