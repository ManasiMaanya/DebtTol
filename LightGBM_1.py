import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.impute import SimpleImputer

# Load data
print("\n" + "="*80)
print("SALES FORECASTING & STOCK PREDICTION MODEL")
print("="*80)

df = pd.read_csv('sales_data_150_rows.csv')
df['date'] = pd.to_datetime(df['date'])

print("\n Dataset Overview:")
print(f"Total Records: {len(df)}")
print(f"Date Range: {df['date'].min().date()} to {df['date'].max().date()}")
print(f"Number of Branches: {df['branch_id'].nunique()}")
print(f"Number of Products: {df['product_id'].nunique()}")

# Data Analysis
print("DATA ANALYSIS")

# Basic statistics
print("\n Sales Statistics:")
print(df[['quantity_sold', 'selling_price', 'current_stock']].describe())

print("\n Festival Impact:")
festival_sales = df.groupby('festival_flag')['quantity_sold'].agg(['mean', 'sum', 'count'])
festival_sales.index = ['Non-Festival', 'Festival']
print(festival_sales)

# Feature Engineering

print("\nFEATURE ENGINEERING\n")

df_model = df.copy()

# Date features
df_model['day_of_week'] = df_model['date'].dt.dayofweek
df_model['day_of_month'] = df_model['date'].dt.day
df_model['quarter'] = df_model['date'].dt.quarter
df_model['week_of_year'] = df_model['date'].dt.isocalendar().week

# Lag features - sales from previous periods
df_sorted = df_model.sort_values(['product_id', 'branch_id', 'date'])

# Calculate rolling statistics per product-branch combination
df_model['sales_lag_1'] = df_sorted.groupby(['product_id', 'branch_id'])['quantity_sold'].shift(1)
df_model['sales_lag_7'] = df_sorted.groupby(['product_id', 'branch_id'])['quantity_sold'].shift(7)
df_model['sales_rolling_mean_7'] = df_sorted.groupby(['product_id', 'branch_id'])['quantity_sold'].transform(
    lambda x: x.rolling(window=7, min_periods=1).mean()
)
df_model['sales_rolling_std_7'] = df_sorted.groupby(['product_id', 'branch_id'])['quantity_sold'].transform(
    lambda x: x.rolling(window=7, min_periods=1).std()
)

# Stock velocity (how fast stock moves)
df_model['stock_velocity'] = df_model['quantity_sold'] / (df_model['current_stock'] + 1)

# Price features
df_model['profit_margin'] = (df_model['selling_price'] - df_model['cost_price']) / df_model['cost_price']

# Fill NaN values more comprehensively
for col in df_model.select_dtypes(include=[np.number]).columns:
    if df_model[col].isnull().any():
        df_model[col] = df_model[col].fillna(df_model[col].median())

print(" Created features:")
print("   - Temporal: day_of_week, day_of_month, quarter, week_of_year")
print("   - Lag: sales_lag_1, sales_lag_7, sales_rolling_mean_7, sales_rolling_std_7")
print("   - Business: stock_velocity, profit_margin")

# Verify no NaN values remain
print(f"\n   Data cleaning complete. NaN values remaining: {df_model.isnull().sum().sum()}")

# Model Training
print("\n" + "="*80)
print("MODEL TRAINING - SALES PREDICTION")
print("="*80)

# Prepare features
feature_cols = [
    'branch_id', 'product_id', 'current_stock', 'selling_price', 'cost_price',
    'month', 'festival_flag', 'day_of_week', 'day_of_month', 'quarter', 
    'week_of_year', 'sales_lag_1', 'sales_lag_7', 'sales_rolling_mean_7',
    'sales_rolling_std_7', 'stock_velocity', 'profit_margin'
]

X = df_model[feature_cols].copy()
y = df_model['quantity_sold']

# Fill NaN values - use ffill() and bfill() instead of fillna(method=...)
X = X.ffill().bfill().fillna(X.median()).fillna(0)

# Verify no NaN values
print(f"✅ NaN values in features after cleaning: {X.isnull().sum().sum()}")
print(f"✅ NaN values in target: {y.isnull().sum()}")
print(f"✅ Feature matrix shape: {X.shape}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train multiple models
models = {
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5),
    'Linear Regression': LinearRegression()
}

results = {}
trained_models = {}

for name, model in models.items():
    print(f"\n🔄 Training {name}...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    results[name] = {'MAE': mae, 'RMSE': rmse, 'R2': r2}
    trained_models[name] = model
    
    print(f"   MAE: {mae:.2f} units")
    print(f"   RMSE: {rmse:.2f} units")
    print(f"   R² Score: {r2:.4f}")

# Select best model
best_model_name = max(results, key=lambda x: results[x]['R2'])
best_model = trained_models[best_model_name]

print(f"\n🏆 Best Model: {best_model_name} (R² = {results[best_model_name]['R2']:.4f})")

# Feature Importance
print("\n📊 Top 10 Most Important Features:")
if hasattr(best_model, 'feature_importances_'):
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        print(f"   {row['feature']:<25} {row['importance']:.4f}")

# Generate Next Week Predictions
print("\n" + "="*80)
print("NEXT WEEK PREDICTIONS")
print("="*80)

# Get the latest date in dataset
last_date = df['date'].max()
print(f"\nLast date in dataset: {last_date.date()}")

# Create prediction dates for next 7 days
prediction_dates = [last_date + timedelta(days=i+1) for i in range(7)]
print(f"Forecasting from: {prediction_dates[0].date()} to {prediction_dates[-1].date()}")

# Get unique combinations of branch and product
branches = df['branch_id'].unique()
products = df['product_id'].unique()

predictions_list = []

for pred_date in prediction_dates:
    for branch in branches:
        for product in products:
            # Get historical data for this product-branch combination from engineered dataset
            hist_data = df_model[(df_model['branch_id'] == branch) & (df_model['product_id'] == product)]
            
            if len(hist_data) == 0:
                continue
                
            # Use latest values for features
            latest_data = hist_data.iloc[-1]
            
            # Create feature row
            feature_row = {
                'branch_id': branch,
                'product_id': product,
                'current_stock': latest_data['current_stock'],
                'selling_price': latest_data['selling_price'],
                'cost_price': latest_data['cost_price'],
                'month': pred_date.month,
                'festival_flag': 1 if pred_date.month in [1, 2, 7, 8, 11, 12] else 0,  # Common festival months
                'day_of_week': pred_date.dayofweek,
                'day_of_month': pred_date.day,
                'quarter': (pred_date.month - 1) // 3 + 1,
                'week_of_year': pred_date.isocalendar()[1],
                'sales_lag_1': hist_data['quantity_sold'].iloc[-1] if len(hist_data) > 0 else hist_data['quantity_sold'].mean(),
                'sales_lag_7': hist_data['quantity_sold'].iloc[-7] if len(hist_data) > 6 else hist_data['quantity_sold'].mean(),
                'sales_rolling_mean_7': hist_data['quantity_sold'].tail(7).mean(),
                'sales_rolling_std_7': hist_data['quantity_sold'].tail(7).std() if len(hist_data) > 1 else 0,
                'stock_velocity': latest_data['stock_velocity'],
                'profit_margin': latest_data['profit_margin']
            }
            
            # Make prediction
            X_pred = pd.DataFrame([feature_row])[feature_cols]
            predicted_sales = best_model.predict(X_pred)[0]
            predicted_sales = max(0, int(round(predicted_sales)))  # Ensure non-negative integer
            
            # Calculate stock requirement
            # Stock needed = predicted sales + safety stock (20% buffer)
            safety_stock = int(predicted_sales * 0.2)
            stock_requirement = predicted_sales + safety_stock
            
            predictions_list.append({
                'date': pred_date,
                'branch_id': branch,
                'product_id': product,
                'predicted_sales': predicted_sales,
                'stock_requirement': stock_requirement,
                'current_stock': int(latest_data['current_stock']),
                'reorder_needed': stock_requirement > latest_data['current_stock'],
                'reorder_quantity': max(0, stock_requirement - int(latest_data['current_stock']))
            })

predictions_df = pd.DataFrame(predictions_list)

# Summary Statistics
print("\n📊 Weekly Forecast Summary:")
print(f"Total Predicted Sales (Next 7 Days): {predictions_df['predicted_sales'].sum():,.0f} units")
print(f"Average Daily Sales: {predictions_df.groupby('date')['predicted_sales'].sum().mean():,.0f} units")
print(f"Total Stock Requirement: {predictions_df['stock_requirement'].sum():,.0f} units")
print(f"Products Requiring Reorder: {predictions_df['reorder_needed'].sum()} out of {len(predictions_df)}")

# Top products by predicted sales
print("\n🔥 Top 10 Products by Predicted Sales (Next Week):")
top_products = predictions_df.groupby('product_id').agg({
    'predicted_sales': 'sum',
    'stock_requirement': 'sum',
    'reorder_quantity': 'sum'
}).sort_values('predicted_sales', ascending=False).head(10)

for idx, (product, row) in enumerate(top_products.iterrows(), 1):
    print(f"   {idx}. Product {product}: {row['predicted_sales']:.0f} units predicted, "
          f"Stock needed: {row['stock_requirement']:.0f} units")

# Branch-wise predictions
print("\n🏢 Branch-wise Weekly Forecast:")
branch_summary = predictions_df.groupby('branch_id').agg({
    'predicted_sales': 'sum',
    'stock_requirement': 'sum',
    'reorder_needed': 'sum'
}).round(0)

for branch in branch_summary.index:
    print(f"   Branch {branch}: {branch_summary.loc[branch, 'predicted_sales']:.0f} units predicted, "
          f"{branch_summary.loc[branch, 'reorder_needed']:.0f} products need reorder")

# Daily predictions
print("\n📅 Day-by-Day Forecast:")
daily_forecast = predictions_df.groupby('date').agg({
    'predicted_sales': 'sum',
    'stock_requirement': 'sum'
}).round(0)

for date, row in daily_forecast.iterrows():
    day_name = date.strftime('%A, %B %d, %Y')
    print(f"   {day_name}: {row['predicted_sales']:.0f} units expected")

# Critical Stock Alerts
print("\n⚠️  CRITICAL STOCK ALERTS - Immediate Reorder Required:")
critical_reorders = predictions_df[predictions_df['reorder_quantity'] > 50].sort_values(
    'reorder_quantity', ascending=False
).head(15)

if len(critical_reorders) > 0:
    for idx, row in critical_reorders.iterrows():
        print(f"   🚨 Branch {row['branch_id']}, Product {row['product_id']}: "
              f"ORDER {row['reorder_quantity']:.0f} units ASAP! "
              f"(Current: {row['current_stock']:.0f}, Needed: {row['stock_requirement']:.0f})")
else:
    print("   ✅ No critical stock shortages detected")

# Save detailed predictions
output_file = '/mnt/user-data/outputs/next_week_predictions.csv'
predictions_df.to_csv(output_file, index=False)
print(f"\n💾 Detailed predictions saved to: next_week_predictions.csv")

# Create visualizations
print("\n📈 Generating visualizations...")

fig = plt.figure(figsize=(20, 12))

# 1. Daily Sales Forecast
ax1 = plt.subplot(2, 3, 1)
daily_sales = predictions_df.groupby('date')['predicted_sales'].sum()
ax1.plot(daily_sales.index, daily_sales.values, marker='o', linewidth=2, markersize=8, color='#2ecc71')
ax1.fill_between(daily_sales.index, daily_sales.values, alpha=0.3, color='#2ecc71')
ax1.set_title('Daily Sales Forecast - Next 7 Days', fontsize=14, fontweight='bold')
ax1.set_xlabel('Date', fontsize=11)
ax1.set_ylabel('Predicted Sales (units)', fontsize=11)
ax1.grid(True, alpha=0.3)
ax1.tick_params(axis='x', rotation=45)

# 2. Top 10 Products
ax2 = plt.subplot(2, 3, 2)
top_10 = predictions_df.groupby('product_id')['predicted_sales'].sum().sort_values(ascending=True).tail(10)
ax2.barh(range(len(top_10)), top_10.values, color='#3498db')
ax2.set_yticks(range(len(top_10)))
ax2.set_yticklabels([f'Product {p}' for p in top_10.index])
ax2.set_title('Top 10 Products by Predicted Sales', fontsize=14, fontweight='bold')
ax2.set_xlabel('Predicted Sales (units)', fontsize=11)
ax2.grid(True, alpha=0.3, axis='x')

# 3. Branch Performance
ax3 = plt.subplot(2, 3, 3)
branch_sales = predictions_df.groupby('branch_id')['predicted_sales'].sum().sort_values(ascending=False)
colors = plt.cm.viridis(np.linspace(0, 1, len(branch_sales)))
ax3.bar(range(len(branch_sales)), branch_sales.values, color=colors)
ax3.set_xticks(range(len(branch_sales)))
ax3.set_xticklabels([f'B{b}' for b in branch_sales.index])
ax3.set_title('Branch-wise Sales Forecast', fontsize=14, fontweight='bold')
ax3.set_xlabel('Branch', fontsize=11)
ax3.set_ylabel('Predicted Sales (units)', fontsize=11)
ax3.grid(True, alpha=0.3, axis='y')

# 4. Stock Requirement vs Current Stock
ax4 = plt.subplot(2, 3, 4)
stock_summary = predictions_df.groupby('branch_id').agg({
    'current_stock': 'sum',
    'stock_requirement': 'sum'
})
x = np.arange(len(stock_summary))
width = 0.35
ax4.bar(x - width/2, stock_summary['current_stock'], width, label='Current Stock', color='#e74c3c')
ax4.bar(x + width/2, stock_summary['stock_requirement'], width, label='Required Stock', color='#2ecc71')
ax4.set_xticks(x)
ax4.set_xticklabels([f'Branch {b}' for b in stock_summary.index])
ax4.set_title('Stock Status by Branch', fontsize=14, fontweight='bold')
ax4.set_xlabel('Branch', fontsize=11)
ax4.set_ylabel('Stock Level (units)', fontsize=11)
ax4.legend()
ax4.grid(True, alpha=0.3, axis='y')

# 5. Reorder Analysis
ax5 = plt.subplot(2, 3, 5)
reorder_data = predictions_df.groupby('branch_id')['reorder_needed'].sum()
colors_reorder = ['#e74c3c' if val > 5 else '#f39c12' if val > 2 else '#2ecc71' for val in reorder_data.values]
ax5.bar(range(len(reorder_data)), reorder_data.values, color=colors_reorder)
ax5.set_xticks(range(len(reorder_data)))
ax5.set_xticklabels([f'Branch {b}' for b in reorder_data.index])
ax5.set_title('Products Requiring Reorder by Branch', fontsize=14, fontweight='bold')
ax5.set_xlabel('Branch', fontsize=11)
ax5.set_ylabel('Number of Products', fontsize=11)
ax5.grid(True, alpha=0.3, axis='y')

# 6. Model Performance
ax6 = plt.subplot(2, 3, 6)
model_names = list(results.keys())
r2_scores = [results[m]['R2'] for m in model_names]
colors_model = ['#2ecc71' if m == best_model_name else '#95a5a6' for m in model_names]
ax6.bar(range(len(model_names)), r2_scores, color=colors_model)
ax6.set_xticks(range(len(model_names)))
ax6.set_xticklabels(model_names, rotation=15, ha='right')
ax6.set_title('Model Performance Comparison', fontsize=14, fontweight='bold')
ax6.set_ylabel('R² Score', fontsize=11)
ax6.set_ylim(0, 1)
ax6.axhline(y=0.7, color='r', linestyle='--', alpha=0.5, label='Good Performance')
ax6.legend()
ax6.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
viz_file = '/mnt/user-data/outputs/sales_forecast_visualizations.png'
plt.savefig(viz_file, dpi=300, bbox_inches='tight')
print(f"✅ Visualizations saved to: sales_forecast_visualizations.png")

# Create summary report
print("\n" + "="*80)
print("GENERATING SUMMARY REPORT")
print("="*80)

report_content = f"""
SALES FORECASTING & STOCK PREDICTION REPORT
{'='*80}

EXECUTIVE SUMMARY
-----------------
Model Used: {best_model_name}
Model Accuracy (R²): {results[best_model_name]['R2']:.4f}
Forecast Period: {prediction_dates[0].strftime('%B %d, %Y')} - {prediction_dates[-1].strftime('%B %d, %Y')}

WEEKLY FORECAST SUMMARY
-----------------------
• Total Predicted Sales: {predictions_df['predicted_sales'].sum():,.0f} units
• Average Daily Sales: {predictions_df.groupby('date')['predicted_sales'].sum().mean():,.0f} units
• Total Stock Requirement: {predictions_df['stock_requirement'].sum():,.0f} units
• Products Requiring Reorder: {predictions_df['reorder_needed'].sum()} items

TOP 5 PRODUCTS BY PREDICTED SALES
----------------------------------
"""

for idx, (product, row) in enumerate(top_products.head(5).iterrows(), 1):
    report_content += f"{idx}. Product {product}: {row['predicted_sales']:.0f} units (Stock needed: {row['stock_requirement']:.0f})\n"

report_content += f"""

DAILY FORECAST BREAKDOWN
-------------------------
"""

for date, row in daily_forecast.iterrows():
    day_name = date.strftime('%A, %B %d')
    report_content += f"{day_name}: {row['predicted_sales']:.0f} units expected\n"

report_content += f"""

CRITICAL STOCK ALERTS
---------------------
"""

if len(critical_reorders) > 0:
    for idx, row in critical_reorders.head(10).iterrows():
        report_content += f"⚠️  Branch {row['branch_id']}, Product {row['product_id']}: ORDER {row['reorder_quantity']:.0f} units\n"
        report_content += f"   (Current Stock: {row['current_stock']:.0f}, Required: {row['stock_requirement']:.0f})\n\n"
else:
    report_content += "✅ No critical stock shortages detected\n"

report_content += f"""

RECOMMENDATIONS
---------------
1. Review and approve reorder quantities for {predictions_df['reorder_needed'].sum()} products
2. Focus on top 10 products which account for {(top_products['predicted_sales'].sum() / predictions_df['predicted_sales'].sum() * 100):.1f}% of predicted sales
3. Monitor branches with high reorder requirements for potential issues
4. Consider increasing safety stock for products with high variability
5. Plan for potential festival period increases in demand

MODEL PERFORMANCE METRICS
--------------------------
"""

for name, metrics in results.items():
    report_content += f"{name}:\n"
    report_content += f"  • Mean Absolute Error: {metrics['MAE']:.2f} units\n"
    report_content += f"  • Root Mean Squared Error: {metrics['RMSE']:.2f} units\n"
    report_content += f"  • R² Score: {metrics['R2']:.4f}\n\n"

report_file = '/mnt/user-data/outputs/forecast_summary_report.txt'
with open(report_file, 'w') as f:
    f.write(report_content)

print("✅ Summary report saved to: forecast_summary_report.txt")

print("\n" + "="*80)
print("✅ ANALYSIS COMPLETE!")
print("="*80)
print("\nGenerated Files:")
print("1. next_week_predictions.csv - Detailed daily predictions")
print("2. sales_forecast_visualizations.png - Visual analysis")
print("3. forecast_summary_report.txt - Executive summary")
print("\n" + "="*80)