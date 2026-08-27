"""Analyze decision-threshold tradeoffs on the held-out synthetic test set."""

from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, precision_score, recall_score


ROOT = Path(__file__).resolve().parents[1]
SAVED = ROOT / "model" / "saved"
OUTPUT_CSV = SAVED / "threshold_analysis.csv"
OUTPUT_PNG = SAVED / "pr_threshold_curve.png"


def analyze_thresholds() -> pd.DataFrame:
    model = joblib.load(SAVED / "risk_model.joblib")
    scaler = joblib.load(SAVED / "scaler.joblib")
    X_test = joblib.load(SAVED / "X_test.joblib")
    y_test = np.asarray(joblib.load(SAVED / "y_test.joblib"))

    probabilities = model.predict_proba(scaler.transform(X_test))[:, 1]
    rows = []
    for threshold in np.arange(0.05, 1.0, 0.05):
        predictions = (probabilities >= threshold).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_test, predictions, labels=[0, 1]).ravel()
        rows.append(
            {
                "threshold": round(float(threshold), 2),
                "precision": round(float(precision_score(y_test, predictions, zero_division=0)), 4),
                "recall": round(float(recall_score(y_test, predictions, zero_division=0)), 4),
                "false_positive_rate": round(float(fp / max(fp + tn, 1)), 4),
                "false_positives": int(fp),
                "true_negatives": int(tn),
                "false_negatives": int(fn),
                "true_positives": int(tp),
            }
        )

    analysis = pd.DataFrame(rows)
    analysis.to_csv(OUTPUT_CSV, index=False)

    figure, axis = plt.subplots(figsize=(8, 5))
    axis.plot(analysis["threshold"], analysis["precision"], marker="o", label="Precision")
    axis.plot(analysis["threshold"], analysis["recall"], marker="o", label="Recall")
    axis.plot(analysis["threshold"], analysis["false_positive_rate"], marker="o", label="False-positive rate")
    axis.set_title("Decision Threshold Tradeoffs")
    axis.set_xlabel("Fraud probability threshold")
    axis.set_ylabel("Rate")
    axis.set_ylim(0, 1.05)
    axis.grid(alpha=0.25)
    axis.legend()
    figure.tight_layout()
    figure.savefig(OUTPUT_PNG, dpi=160)
    plt.close(figure)

    return analysis


if __name__ == "__main__":
    result = analyze_thresholds()
    print(f"Saved {len(result)} threshold rows to {OUTPUT_CSV}")
    print(f"Saved chart to {OUTPUT_PNG}")
