# DebtTol | Multi-Level Retail Intelligence

DebtTol is a multi-level retail intelligence dashboard designed to help businesses monitor profitability, analyze branch performance, and forecast product demand using AI-driven simulation. It enables drill-down analytics from company-level insights down to product-level forecasting, delivered through a professional SaaS-style interface.

---

## Vision
Retail businesses struggle with:
* Overstocking low-demand products
* Stock-outs in high-demand branches
* Poor visibility across multi-branch operations
* Reactive instead of predictive inventory planning

DebtTol demonstrates how AI-powered forecasting and hierarchical analytics can solve these problems.

---

## Architecture Overview
DebtTol follows a hierarchical analytics structure:

1. Company (Global P&L and Branch Heatmaps)
2. Branch (Regional Revenue and Risk KPIs)
3. Category (Departmental Performance)
4. Product (SKU-level AI Forecasting)

Each level unlocks progressively deeper operational insights.

---

## Features

### Dashboard Analytics
* **Company Overview:** Monthly profit/loss trends and branch-level performance heatmaps (Green for Profit / Red for Loss).
* **Branch Dashboard:** KPI cards for Total Revenue, Risk Products, and Surplus Products with category-level drill-downs.
* **Category Dashboard:** Performance metrics and product-level profitability heatmaps.
* **Product Dashboard:** Demand forecast visualization and AI Simulation tools.

### AI Simulation Logic
The current version uses structured mock data to simulate demand adjustments. It highlights stock risk scenarios and demonstrates predictive modeling impact. Future iterations will include:
* Time-series forecasting (Prophet/LSTM) trained on historical sales.
* Branch-level inventory optimization.
* Automated redistribution recommendations.

### Authentication & Security
* Simulated login system with token-based route protection.
* Protected dashboard access via React Router.
* OAuth-ready backend architecture with Google OAuth support via Passport.js.

---

## Tech Stack

**Frontend**
* React.js
* React Router
* Recharts (Data Visualization)
* Custom CSS (Premium UI styling)
* LocalStorage (Session management)

**Backend**
* Node.js & Express.js
* MySQL
* JWT Authentication
* Passport.js (Google OAuth configuration)
* REST API architecture

---
