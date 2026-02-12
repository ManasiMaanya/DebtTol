# DebtTol

DebtTol is a multi-level retail intelligence dashboard designed to help businesses monitor profitability, analyze branch performance, and forecast product demand using AI-driven simulations.

Built as a premium \ analytics platform, DebtTol allows users to drill down from company-level insights to product-level forecasting with a clean, interactive UI.

---

##  Features

###  Authentication & Protected Routes
- Simulated login system
- Route protection using token-based authentication
- Secure access to operational dashboards

---

###  Company Overview Dashboard
- Monthly profit/loss revenue trend chart
- Branch-level performance heatmap (green = profit, red = loss)
- Clickable branch drill-down navigation

---

###  Branch Dashboard
- Branch revenue trend visualization
- KPI cards:
  - Total Revenue
  - Risk Products
  - Surplus Products
- Category-level performance heatmap
- Drill-down to category analytics

---

###  Category Dashboard
- Category revenue trend
- Category-level KPIs
- Product-level profitability heatmap
- Drill-down to product forecasting

---

###  Product Dashboard
- Demand forecast visualization
- AI simulation button (increases demand dynamically)
- Product KPIs:
  - Total Forecast Demand
  - Average Monthly Demand
  - Stock Risk Level

---

## How It Works

DebtTol demonstrates a hierarchical analytics architecture:

Company → Branch → Category → Product

Each level provides progressively detailed operational insights.

The AI simulation feature demonstrates how predictive analytics can proactively adjust demand forecasts and highlight potential inventory risks.

Currently, the system uses mock data to simulate forecasting and financial insights. In production, it would connect to a machine learning model trained on historical sales data across multiple branches.

---

## 🛠 Tech Stack

- React.js
- React Router
- Recharts (Data Visualization)
- CSS (Custom SaaS-style UI)
- LocalStorage (Auth Simulation)

---

## Project Structure
src/
│
├── components/
│ ├── Layout.js
│ ├── ProtectedRoute.js
│ └── ScrollToTop.js
│
├── pages/
│ ├── Landing.js
│ ├── Login.js
│ ├── Dashboard.js
│ ├── Branch.js
│ ├── Category.js
│ └── Product.js
│
├── App.js
└── App.css

