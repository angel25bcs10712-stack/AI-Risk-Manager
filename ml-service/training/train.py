"""
RiskGuard AI — Model Training & Evaluation Pipeline
Trains a calibrated ensemble/Gradient Boosting classifier on synthetic transaction data,
evaluates performance on a 2,000-sample held-out test set, and saves model artifacts.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    accuracy_score, confusion_matrix, roc_curve, precision_recall_curve
)
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.dataset_generator import get_train_test_splits

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

def train_and_save_model():
    print("[Training] Generating training and held-out test datasets...")
    train_df, test_df = get_train_test_splits(n_samples=12000, test_size=0.1667, random_seed=42)
    
    X_train = train_df[FEATURE_NAMES]
    y_train = train_df['is_fraud']
    
    X_test = test_df[FEATURE_NAMES]
    y_test = test_df['is_fraud']
    
    print(f"[Training] Training on {len(X_train)} samples, testing on {len(X_test)} samples.")
    
    # 1. Feature Standardization
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 2. Gradient Boosting Classifier with balanced parameters
    model = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=4,
        subsample=0.85,
        random_state=42
    )
    
    print("[Training] Fitting Gradient Boosting model...")
    model.fit(X_train_scaled, y_train)
    
    # 3. Model Evaluation on Held-Out Test Set
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    acc = accuracy_score(y_test, y_pred)
    
    # ROC Curve downsampled points
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_points = []
    step = max(1, len(fpr) // 30)
    for i in range(0, len(fpr), step):
        roc_points.append({"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)})
    if roc_points[-1]["fpr"] != 1.0:
        roc_points.append({"fpr": 1.0, "tpr": 1.0})

    # Precision-Recall Curve points
    prec_pts, rec_pts, _ = precision_recall_curve(y_test, y_prob)
    pr_points = []
    pr_step = max(1, len(prec_pts) // 30)
    for i in range(0, len(prec_pts), pr_step):
        pr_points.append({"recall": round(float(rec_pts[i]), 4), "precision": round(float(prec_pts[i]), 4)})

    # Feature Importances
    importances = model.feature_importances_
    total_imp = np.sum(importances)
    feature_imp_list = [
        {"feature": name, "importance": round(float(imp / total_imp) * 100, 2)}
        for name, imp in zip(FEATURE_NAMES, importances)
    ]
    feature_imp_list.sort(key=lambda x: x["importance"], reverse=True)
    
    metrics = {
        "dataset_info": {
            "name": "Synthetic Financial Risk Benchmark Dataset",
            "type": "Calibrated Synthetic Payment Transactions",
            "total_samples": 12000,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "test_fraud_rate": round(float(y_test.mean()), 4),
            "note": "Evaluation performed on 2,000 held-out test samples."
        },
        "model_architecture": {
            "algorithm": "Gradient Boosting Decision Trees (GBDT)",
            "n_estimators": 150,
            "max_depth": 4,
            "scaler": "StandardScaler"
        },
        "metrics": {
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "accuracy": round(float(acc), 4)
        },
        "confusion_matrix": {
            "true_positive": int(tp),
            "false_positive": int(fp),
            "true_negative": int(tn),
            "false_negative": int(fn),
            "total_test": int(len(y_test))
        },
        "rates": {
            "true_positive_rate": round(float(tp / (tp + fn)), 4),
            "false_positive_rate": round(float(fp / (fp + tn)), 4),
            "specificity": round(float(tn / (tn + fp)), 4)
        },
        "roc_curve": roc_points,
        "precision_recall_curve": pr_points,
        "feature_importances": feature_imp_list
    }
    
    # Save artifacts
    save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model', 'saved')
    os.makedirs(save_dir, exist_ok=True)
    
    model_path = os.path.join(save_dir, 'risk_model.joblib')
    scaler_path = os.path.join(save_dir, 'scaler.joblib')
    metrics_path = os.path.join(save_dir, 'metrics.joblib')
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(metrics, metrics_path)
    
    print(f"[Training] Saved model to {model_path}")
    print(f"[Training] Results — Precision: {prec:.3f}, Recall: {rec:.3f}, F1: {f1:.3f}, ROC-AUC: {auc:.3f}")
    
    return model, scaler, metrics

if __name__ == "__main__":
    train_and_save_model()
