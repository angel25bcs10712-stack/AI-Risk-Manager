"""
RiskGuard AI — ML Risk Engine FastAPI Service
Exposes REST endpoints for real-time risk scoring, feature explanation, and model evaluation metrics.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import sys

# Ensure ml-service root is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from model.risk_classifier import RiskClassifier

app = FastAPI(
    title="RiskGuard AI — ML Risk Engine",
    description="Explainable Payment Fraud & Risk Analysis Engine powered by Scikit-Learn",
    version="1.0.0"
)

# Enable CORS for local development and microservice communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Risk Classifier on startup
risk_engine = RiskClassifier()

class TransactionRiskInput(BaseModel):
    amount: float = Field(..., description="Transaction amount in USD", ge=0.01)
    transaction_frequency: Optional[int] = Field(0, description="Transactions in last 10 mins", ge=0)
    device_age: Optional[float] = Field(30.0, description="Device age in days", ge=0)
    is_new_device: Optional[bool] = Field(None, description="Explicit new device flag")
    location_change: Optional[bool] = Field(False, description="Location differs from usual")
    failed_transactions: Optional[int] = Field(0, description="Recent failed auth/CVV attempts", ge=0)
    account_age: Optional[float] = Field(90.0, description="Account age in days", ge=0)
    previous_average: Optional[float] = Field(None, description="Historical average amount", ge=0)
    transaction_hour: Optional[int] = Field(12, description="Hour of day 0-23", ge=0, le=23)
    previous_chargebacks: Optional[int] = Field(0, description="Historical chargeback count", ge=0)

    model_config = {
        "json_schema_extra": {
            "example": {
                "amount": 4850.00,
                "previous_average": 850.00,
                "transaction_frequency": 5,
                "failed_transactions": 3,
                "device_age": 1.0,
                "location_change": True,
                "account_age": 20.0,
                "transaction_hour": 3,
                "previous_chargebacks": 1
            }
        }
    }

class PredictionResponse(BaseModel):
    fraud_probability: float
    risk_score: int
    risk_level: str
    recommendation: str
    risk_factors: List[str]
    feature_snapshot: Dict[str, Any]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RiskGuard AI Risk Engine",
        "version": "1.0.0",
        "model_loaded": risk_engine.model is not None
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_risk(payload: TransactionRiskInput):
    """
    Evaluates transaction risk using trained ML model and dynamic factor extraction.
    """
    try:
        data_dict = payload.model_dump()
        result = risk_engine.predict(data_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/evaluate")
def get_model_evaluation():
    """
    Returns authentic evaluation metrics (Precision, Recall, F1, ROC-AUC, Confusion Matrix)
    calculated on held-out test data.
    """
    try:
        metrics = risk_engine.get_evaluation_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")

@app.get("/features")
def get_feature_definitions():
    """Returns documentation on the model's feature set."""
    return {
        "features": [
            {"name": "amount", "description": "Transaction amount in USD", "type": "float"},
            {"name": "previous_average", "description": "Customer historical baseline average", "type": "float"},
            {"name": "amount_to_avg_ratio", "description": "amount / previous_average", "type": "float"},
            {"name": "transaction_frequency", "description": "Velocity count in past 10 minutes", "type": "int"},
            {"name": "failed_transactions", "description": "Failed PIN/CVV/auth attempts", "type": "int"},
            {"name": "device_age", "description": "Age of device fingerprint in days", "type": "float"},
            {"name": "is_new_device", "description": "Binary flag for new hardware fingerprint", "type": "int"},
            {"name": "location_change", "description": "Mismatch from normal customer geo-region", "type": "int"},
            {"name": "transaction_hour", "description": "Hour of day (0-23)", "type": "int"},
            {"name": "account_age", "description": "Account longevity in days", "type": "float"},
            {"name": "previous_chargebacks", "description": "Historical dispute count", "type": "int"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
