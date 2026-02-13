import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from lightgbm import LGBMRegressor
from sklearn.model_selection import TimeSeriesSplit
from datetime import timedelta
import warnings

# Suppress the "no further splits" warning
warnings.filterwarnings('ignore')

# ==========================================
# 1️⃣ CONNECT & LOAD DATA
# ==========================================
engine = create_engine("mysql+pymysql://root:Password@localhost/retail_analytics_final")

query = """
SELECT 
    transaction_date AS date, 
    branch_id, product_id, product_name, category, 
    quantity_sold, selling_price, cost_price, 
    discount_percentage, current_stock, festival_flag 
FROM Fact_Sales;
"""
df = pd.read_sql(query, engine)
df["date"] = pd.to_datetime(df["date"])

# ==========================================
# 2️⃣ ROBUST FEATURE ENGINEERING
# ==========================================
df = df.sort_values(["branch_id", "product_id", "date"])

# Create Lags (The "Memory")
for lag in [1, 2, 3, 4]:
    df[f"lag_{lag}"] = df.groupby(["branch_id", "product_id"])["quantity_sold"].shift(lag)

# Create Rolling Mean (The "Trend")
df["rolling_mean_4"] = (
    df.groupby(["branch_id", "product_id"])["quantity_sold"]
      .shift(1).rolling(4).mean()
)

# Time Context
df["week"] = df["date"].dt.isocalendar().week.astype(int)
df["month"] = df["date"].dt.month

df.dropna(inplace=True)

# ==========================================
# 3️⃣ TRAIN THE MASTER DEMAND MODEL
# ==========================================
features = [
    "lag_1", "lag_2", "lag_3", "lag_4", "rolling_mean_4",
    "selling_price", "discount_percentage", "festival_flag", 
    "week", "month"
]

X = df[features]
y = df["quantity_sold"]

# Use TimeSeriesSplit for validation to respect the timeline
tscv = TimeSeriesSplit(n_splits=5)

model = LGBMRegressor(
    n_estimators=500,        # Higher capacity
    learning_rate=0.03,      # Slower learning = better accuracy
    num_leaves=31,           # Controls complexity
    max_depth=-1,
    random_state=42,
    verbose=-1               # Silences the warning
)

# Train on all available data for the final production model
model.fit(X, y)
print("AI Model Trained Successfully.")

# ==========================================
# 4️⃣ THE "CRYSTAL BALL" ENGINE
# ==========================================

def get_last_known_state(df, branch, product):
    """Helper to get the most recent data point for a product."""
    subset = df[(df["branch_id"] == branch) & (df["product_id"] == product)]
    if len(subset) < 4: return None
    return subset.iloc[-1]

def predict_comprehensive(branch, product):
    row = get_last_known_state(df, branch, product)
    if row is None: return None

    # Base Features for Next Week
    base_features = {
        "lag_1": row["quantity_sold"],
        "lag_2": row["lag_1"],
        "lag_3": row["lag_2"],
        "lag_4": row["lag_3"],
        "rolling_mean_4": np.mean([row["quantity_sold"], row["lag_1"], row["lag_2"], row["lag_3"]]),
        "festival_flag": 0, # Assuming next week is normal; change if needed
        "week": (row["week"] % 52) + 1,
        "month": row["month"]
    }

    # --- PART A: BASELINE PREDICTION (Current Price/Discount) ---
    current_inputs = pd.DataFrame([base_features])
    current_inputs["selling_price"] = row["selling_price"]
    current_inputs["discount_percentage"] = row["discount_percentage"]
    
    pred_qty = max(0, model.predict(current_inputs)[0]) # Ensure no negative sales
    
    # Financial Calculations
    pred_revenue = pred_qty * row["selling_price"]
    pred_profit = pred_qty * (row["selling_price"] - row["cost_price"])
    
    # Inventory Calculations
    safety_stock = pred_qty * 1.15  # 15% Safety Buffer
    stock_gap = safety_stock - row["current_stock"]
    
    stock_status = " OK"
    if stock_gap > 0: stock_status = " RESTOCK NEEDED"
    elif stock_gap < -20: stock_status = " OVERSTOCKED"

    # --- PART B: OPTIMAL DISCOUNT SIMULATION ---
    # We test: 0%, 10%, 20%, 30% discount to see which maximizes PROFIT
    best_scenario = {"discount": row["discount_percentage"], "profit": pred_profit}
    
    original_price = row["selling_price"] / (1 - (row["discount_percentage"]/100)) # Back-calculate base price
    
    for test_discount in [0, 10, 20, 30]:
        # Calculate new selling price based on test discount
        test_price = original_price * (1 - (test_discount/100))
        
        # Don't test if price drops below cost (loss making)
        if test_price < row["cost_price"]: continue

        # Prepare input
        sim_input = pd.DataFrame([base_features])
        sim_input["selling_price"] = test_price
        sim_input["discount_percentage"] = test_discount
        
        # Predict
        sim_qty = max(0, model.predict(sim_input)[0])
        sim_profit = sim_qty * (test_price - row["cost_price"])
        
        if sim_profit > best_scenario["profit"]:
            best_scenario = {
                "discount": test_discount,
                "profit": sim_profit,
                "qty": sim_qty,
                "reason": "Higher Total Profit"
            }

    # Suggestion Logic
    suggestion = "Maintain Current Strategy"
    if best_scenario["discount"] != row["discount_percentage"]:
        suggestion = f"Change Discount to {best_scenario['discount']}% (Proj. Profit: ${best_scenario['profit']:.2f})"

    return {
        "Branch": branch,
        "Product": row["product_name"],
        "Date": (row["date"] + timedelta(days=7)).strftime('%Y-%m-%d'),
        # Demand Metrics
        "Predicted_Sales_Units": round(pred_qty, 2),
        "Predicted_Revenue": round(pred_revenue, 2),
        "Predicted_Profit": round(pred_profit, 2),
        # Inventory Metrics
        "Current_Stock": row["current_stock"],
        "Required_Stock": round(safety_stock, 0),
        "Stock_Gap": round(stock_gap, 0),
        "Status": stock_status,
        # Strategic Advice
        "AI_Suggestion": suggestion
    }

# ==========================================
# 5️⃣ GENERATE THE MASTER REPORT
# ==========================================
results = []
unique_items = df[['branch_id', 'product_id']].drop_duplicates()

print(" Generating AI Predictions...")
for _, item in unique_items.iterrows():
    res = predict_comprehensive(item['branch_id'], item['product_id'])
    if res: results.append(res)

final_df = pd.DataFrame(results)

# Display Top 5 Urgent Actions
print("\n===  TOP ACTIONS REQUIRED ===")
urgent = final_df[final_df["Stock_Gap"] > 0].sort_values("Predicted_Profit", ascending=False).head(5)
print(urgent[["Product", "Stock_Gap", "Predicted_Profit", "AI_Suggestion"]])