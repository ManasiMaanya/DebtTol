import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

# Load data
df = pd.read_csv("sales_data_150_rows.csv")
df['date'] = pd.to_datetime(df['date'])

# ----------------------------
# Feature Engineering
# ----------------------------

df = df.sort_values(['product_id', 'branch_id', 'date'])

df['day_of_week'] = df['date'].dt.dayofweek
df['month'] = df['date'].dt.month
df['sales_lag_1'] = df.groupby(['product_id','branch_id'])['quantity_sold'].shift(1)

df = df.fillna(method="bfill").fillna(0)

feature_cols = [
    'branch_id','product_id','current_stock',
    'selling_price','cost_price','month',
    'day_of_week','sales_lag_1'
]

X = df[feature_cols]
y = df['quantity_sold']

# ----------------------------
# Train Model
# ----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print("Model R2 Score:", r2_score(y_test, model.predict(X_test)))

# ----------------------------
# Next 7-Day Forecast
# ----------------------------

last_date = df['date'].max()
prediction_dates = [last_date + timedelta(days=i+1) for i in range(7)]

branches = df['branch_id'].unique()
products = df['product_id'].unique()

predictions = []

for date in prediction_dates:
    for branch in branches:
        for product in products:
            hist = df[(df['branch_id']==branch) &
                      (df['product_id']==product)]
            
            if len(hist) == 0:
                continue
            
            latest = hist.iloc[-1]

            row = {
                'branch_id': branch,
                'product_id': product,
                'current_stock': latest['current_stock'],
                'selling_price': latest['selling_price'],
                'cost_price': latest['cost_price'],
                'month': date.month,
                'day_of_week': date.dayofweek,
                'sales_lag_1': latest['quantity_sold']
            }

            X_pred = pd.DataFrame([row])
            pred = int(max(0, round(model.predict(X_pred)[0])))

            predictions.append({
                'date': date,
                'branch_id': branch,
                'product_id': product,
                'predicted_sales': pred
            })

predictions_df = pd.DataFrame(predictions)

print("\nNext 7 Days Total Forecast:")
print(predictions_df.groupby('date')['predicted_sales'].sum())
