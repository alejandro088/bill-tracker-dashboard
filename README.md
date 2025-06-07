# 💸 Bill Tracker Dashboard

A simple and efficient dashboard to manage your **bills, subscriptions, utilities, and taxes** — all in one place. Never miss a due date again!

## 📌 Features

* 🧾 Add and manage bills (electricity, water, internet, etc.)
* 🗕️ Set due dates with automatic reminders
* 📂 Categorize: subscriptions, utilities, taxes, services
* 📈 Monthly and yearly summary view
* 🔔 Notifications for upcoming payments
* 🗂️ Filter by type, date, or payment status
* 🌐 Search by bill name or description
* ⚖️ Mark bills as paid, pending or overdue (auto-updated based on due date)
* 📅 Pagination and sorting support
* 🔎 Filter by category (e.g., utilities, subscriptions, taxes)
* 📃 Local data persistence (optional JSON file backup)
* 📊 Monthly financial summary: compare total paid vs. pending bills
* ✅ Pay bills directly from the dashboard
* ❌ Cancel auto-renewing subscriptions
* 📜 View payment history for each subscription
* 📈 Analytics charts for spending

## 🚀 Stack (suggested)

* **Frontend**: Vue.js or React
* **Backend**: Node.js + Express
* **Database**: MongoDB / PostgreSQL
* **Notifications**: Node-cron + email/SMS integrations

## 🚀 Frontend (UI features)

* 📆 Dashboard with bill table and filters
* 📌 Form to add new bills (name, amount, due date, category)
* 📊 Graphs and charts for monthly expenses (e.g., bar or pie)
* 🌍 Filter/search by name, category or status
* 🔎 Sortable table by due date or amount
* ⚖️ Status indicators: Paid, Pending, Overdue
* 🔍 Real-time feedback for upcoming bills

## 📦 Installation

```bash
git clone https://github.com/tu-user/bill-tracker-dashboard.git
cd bill-tracker-dashboard
npm install
cp .env.example .env
# update DATABASE_URL with your MySQL credentials
npm run migrate
npm run seed
npm run dev
```

## 🧐 Roadmap Ideas

* ✅ Manual input of bills and subscriptions
* 🔄 Sync with bank/API billing
* 📱 Mobile responsive UI
* 📄 Export data (CSV/Excel)
* 🧠 AI suggestion: “You usually pay this around the 10th…”

## 🙌 Contributing

Wanna help? PRs are welcome! Drop your ideas in the Issues tab or submit a pull request.

---

**Don’t let late fees win. Own your finances.**
*— Bill Tracker Dashboard Team*
