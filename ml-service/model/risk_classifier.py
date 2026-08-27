"""
RiskGuard AI — ML Risk Classifier
Loads trained Gradient Boosting / Random Forest model, computes fraud probability & risk score (0-100),
and classifies transactions into LOW, MEDIUM, or HIGH risk with actionable recommendations.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List
from .explainer import RiskFactorExplainer

FEATURE_NAMES = [
    'amount',
    'previous_average',
    'amount_to_avg_ratio',
    'transaction_frequency',
    'failed_transactions',
    'device_age',
    'is_new_device',
    'location_change',
    'transaction_hour',
    'account_age',
    'previous_chargebacks'
]

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved')
MODEL_PATH = os.path.join(MODEL_DIR, 'risk_model.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.joblib')
METRICS_PATH = os.path.join(MODEL_DIR, 'metrics.joblib')

class RiskClassifier:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.metrics = None
        self.load_or_train_model()

    def load_or_train_model(self):
        """Loads serialized model or triggers train pipeline if not present."""
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH) and os.path.exists(METRICS_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                self.metrics = joblib.load(METRICS_PATH)
                print("[RiskClassifier] Loaded pre-trained model and scaler successfully.")
                return
            except Exception as e:
                print(f"[RiskClassifier] Error loading existing model: {e}. Retraining...")

        # If not present or failed to load, import and run training
        try:
            from training.train import train_and_save_model
        except ImportError:
            from ..training.train import train_and_save_model
        print("[RiskClassifier] Training new model...")
        self.model, self.scaler, self.metrics = train_and_save_model()

    def prepare_features(self, data: Dict[str, Any]) -> pd.DataFrame:
        """Extracts and normalizes features into a single-row DataFrame."""
        amount = float(data.get('amount', 0.0))
        previous_avg = float(data.get('previous_average', max(amount, 10.0)))
        
        # Calculate ratio safely
        amount_to_avg_ratio = round(amount / max(previous_avg, 1.0), 3)
        
        device_age = float(data.get('device_age', 30.0))
        is_new_device = 1 if (data.get('is_new_device') is True or device_age <= 2.0) else 0
        location_change = 1 if data.get('location_change') is True else 0

        feature_dict = {
            'amount': amount,
            'previous_average': previous_avg,
            'amount_to_avg_ratio': amount_to_avg_ratio,
            'transaction_frequency': int(data.get('transaction_frequency', 0)),
            'failed_transactions': int(data.get('failed_transactions', 0)),
            'device_age': device_age,
            'is_new_device': is_new_device,
            'location_change': location_change,
            'transaction_hour': int(data.get('transaction_hour', 12)),
            'account_age': float(data.get('account_age', 90.0)),
            'previous_chargebacks': int(data.get('previous_chargebacks', 0))
        }

        df = pd.DataFrame([feature_dict])[FEATURE_NAMES]
        return df, feature_dict

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs ML inference and returns structured prediction object.
        """
        df_features, feature_dict = self.prepare_features(data)
        
        # Scale features
        scaled_features = self.scaler.transform(df_features)
        
        # Compute probabilities: [prob_legit, prob_fraud]
        probabilities = self.model.predict_proba(scaled_features)[0]
        raw_fraud_prob = float(probabilities[1])
        
        # Calculate transparent risk score 0 - 100
        risk_score = int(round(raw_fraud_prob * 100))
        risk_score = max(0, min(100, risk_score))
        
        # Determine classification tier & recommended action
        if risk_score < 40:
            risk_level = "LOW"
            recommendation = "APPROVE"
        elif risk_score < 75:
            risk_level = "MEDIUM"
            recommendation = "MANUAL REVIEW"
        else:
            risk_level = "HIGH"
            # High risk defaults to BLOCK or MANUAL REVIEW depending on severity
            recommendation = "BLOCK" if risk_score >= 85 else "MANUAL REVIEW"

        # Generate explainable risk factors
        risk_factors = RiskFactorExplainer.explain(feature_dict, raw_fraud_prob)

        return {
            "fraud_probability": round(raw_fraud_prob, 4),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "risk_factors": risk_factors,
            "feature_snapshot": feature_dict
        }

    def get_evaluation_metrics(self) -> Dict[str, Any]:
        """Returns held-out test evaluation metrics."""
        if not self.metrics:
            self.load_or_train_model()
        return self.metrics
