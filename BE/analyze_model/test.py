
import joblib
import os

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))

cvec = joblib.load(os.path.join(current_dir, 'cvec.pkl'))
print("cvec loaded")

le_sentiment = joblib.load(os.path.join(current_dir, 'le_sentiment.pkl'))
print("le_sentiment loaded")

xgb_sentiment = joblib.load(os.path.join(current_dir, 'xgb_sentiment.pkl'))
print("xgb_sentiment loaded")  # ← มีโอกาส crash ที่นี่

le_category = joblib.load(os.path.join(current_dir, 'le_category.pkl'))
print("le_category loaded")

xgb_category = joblib.load(os.path.join(current_dir, 'xgb_category.pkl'))
print("xgb_category loaded")
