"""
RiskGuard AI — Synthetic Financial Transaction Dataset Generator
Generates realistic payment transaction data modeling legitimate vs. fraudulent patterns.
"""

import numpy as np
import pandas as pd
from typing import Tuple

def generate_synthetic_transactions(
    n_samples: int = 12000, 
    fraud_ratio: float = 0.12, 
    random_seed: int = 42
) -> pd.DataFrame:
    """
    Generates a realistic transaction dataframe with key fraud risk features.
    
    Features:
    - amount: Transaction amount in USD
    - previous_average: Customer's historical typical transaction average
    - amount_to_avg_ratio: amount / previous_average
    - transaction_frequency: Number of transactions by customer in last 10 minutes
    - failed_transactions: Number of recent failed attempts (PIN/CVV/auth)
    - device_age: Age of the device in days (0 indicates new device)
    - is_new_device: Binary flag (device_age <= 2 days)
    - location_change: 1 if location differs from customer usual home region, else 0
    - transaction_hour: Hour of transaction (0-23)
    - account_age: Age of customer account in days
    - previous_chargebacks: Count of historical chargebacks on account
    - is_fraud: Binary target (0 = Legitimate, 1 = Fraudulent/High-Risk)
    """
    np.random.seed(random_seed)
    
    n_fraud = int(n_samples * fraud_ratio)
    n_legit = n_samples - n_fraud
    
    # -------------------------------------------------------------
    # 1. Legitimate Transactions Generator
    # -------------------------------------------------------------
    # Typical customer averages: Log-normal distribution around $40 - $250
    legit_prev_avg = np.random.lognormal(mean=4.2, sigma=0.75, size=n_legit)
    legit_prev_avg = np.clip(legit_prev_avg, 10.0, 3000.0)
    
    # Legit amounts are close to customer average (multipliers usually 0.3x to 2.2x)
    amount_multiplier = np.random.normal(loc=1.0, scale=0.35, size=n_legit)
    amount_multiplier = np.clip(amount_multiplier, 0.1, 3.0)
    legit_amounts = legit_prev_avg * amount_multiplier
    
    # Legit velocity in 10 mins is low (usually 0-2)
    legit_frequency = np.random.choice([0, 1, 2, 3], size=n_legit, p=[0.70, 0.22, 0.06, 0.02])
    
    # Legit failed attempts are rare (mostly 0, rarely 1)
    legit_failed = np.random.choice([0, 1, 2], size=n_legit, p=[0.94, 0.05, 0.01])
    
    # Legit device age is mature (days)
    legit_device_age = np.random.exponential(scale=180, size=n_legit) + 3
    legit_device_age = np.clip(legit_device_age, 0, 1200)
    legit_is_new_device = (legit_device_age <= 2).astype(int)
    
    # Legit location changes happen occasionally (e.g. travel ~ 6%)
    legit_location_change = np.random.choice([0, 1], size=n_legit, p=[0.93, 0.07])
    
    # Normal transaction hours: concentrated between 8 AM and 11 PM
    hour_probs = np.array([
        0.01, 0.01, 0.01, 0.01, 0.01, 0.02, # 0-5 AM
        0.04, 0.06, 0.08, 0.08, 0.07, 0.07, # 6-11 AM
        0.08, 0.07, 0.07, 0.07, 0.06, 0.06, # 12-5 PM
        0.06, 0.05, 0.04, 0.03, 0.01, 0.01  # 6-11 PM
    ])
    hour_probs = hour_probs / np.sum(hour_probs)
    legit_hours = np.random.choice(range(24), size=n_legit, p=hour_probs)
    
    # Legit account age (days)
    legit_account_age = np.random.exponential(scale=365, size=n_legit) + 14
    legit_account_age = np.clip(legit_account_age, 5, 2500)
    
    # Legit chargebacks are almost always 0
    legit_chargebacks = np.random.choice([0, 1], size=n_legit, p=[0.985, 0.015])
    
    df_legit = pd.DataFrame({
        'amount': np.round(legit_amounts, 2),
        'previous_average': np.round(legit_prev_avg, 2),
        'transaction_frequency': legit_frequency,
        'failed_transactions': legit_failed,
        'device_age': np.round(legit_device_age, 1),
        'is_new_device': legit_is_new_device,
        'location_change': legit_location_change,
        'transaction_hour': legit_hours,
        'account_age': np.round(legit_account_age, 1),
        'previous_chargebacks': legit_chargebacks,
        'is_fraud': 0
    })
    
    # -------------------------------------------------------------
    # 2. Fraudulent / High-Risk Transactions Generator
    # -------------------------------------------------------------
    fraud_prev_avg = np.random.lognormal(mean=4.0, sigma=0.8, size=n_fraud)
    fraud_prev_avg = np.clip(fraud_prev_avg, 10.0, 2000.0)
    
    # Fraud patterns:
    # Mode A: Account Takeover (Huge amount multiplier, new device, location jump)
    # Mode B: Card Velocity Testing (Rapid successive transactions, failed PIN/CVVs)
    # Mode C: Brand New Account Drain (Account age < 3 days, maxed-out amount)
    # Mode D: Off-Hours Location Anomaly with elevated chargebacks
    fraud_modes = np.random.choice(['ATO', 'VELOCITY', 'NEW_ACCT', 'GEO_ANOMALY'], size=n_fraud, p=[0.35, 0.30, 0.20, 0.15])
    
    fraud_amounts = np.zeros(n_fraud)
    fraud_frequency = np.zeros(n_fraud, dtype=int)
    fraud_failed = np.zeros(n_fraud, dtype=int)
    fraud_device_age = np.zeros(n_fraud)
    fraud_location_change = np.zeros(n_fraud, dtype=int)
    fraud_hours = np.zeros(n_fraud, dtype=int)
    fraud_account_age = np.zeros(n_fraud)
    fraud_chargebacks = np.zeros(n_fraud, dtype=int)
    
    for i, mode in enumerate(fraud_modes):
        if mode == 'ATO':
            # 4x to 15x normal customer average
            mult = np.random.uniform(4.0, 18.0)
            fraud_amounts[i] = fraud_prev_avg[i] * mult
            fraud_frequency[i] = np.random.randint(1, 6)
            fraud_failed[i] = np.random.choice([0, 1, 2, 3], p=[0.3, 0.3, 0.25, 0.15])
            fraud_device_age[i] = np.random.uniform(0.0, 1.5) # Brand new device
            fraud_location_change[i] = np.random.choice([0, 1], p=[0.15, 0.85])
            fraud_hours[i] = np.random.randint(0, 24)
            fraud_account_age[i] = np.random.uniform(30, 600)
            fraud_chargebacks[i] = np.random.choice([0, 1, 2], p=[0.8, 0.15, 0.05])
            
        elif mode == 'VELOCITY':
            # Card testing: medium/high frequency, high failed attempts
            fraud_amounts[i] = np.random.uniform(25.0, 1500.0)
            fraud_frequency[i] = np.random.randint(3, 10)
            fraud_failed[i] = np.random.choice([1, 2, 3, 4, 5], p=[0.2, 0.35, 0.25, 0.15, 0.05])
            fraud_device_age[i] = np.random.exponential(scale=15)
            fraud_location_change[i] = np.random.choice([0, 1], p=[0.45, 0.55])
            fraud_hours[i] = np.random.choice(range(24))
            fraud_account_age[i] = np.random.uniform(5, 200)
            fraud_chargebacks[i] = np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1])
            
        elif mode == 'NEW_ACCT':
            # Brand new account bust-out
            fraud_amounts[i] = np.random.uniform(400.0, 6500.0)
            fraud_prev_avg[i] = np.random.uniform(50.0, 400.0)
            fraud_frequency[i] = np.random.randint(1, 6)
            fraud_failed[i] = np.random.choice([0, 1, 2], p=[0.4, 0.4, 0.2])
            fraud_device_age[i] = np.random.uniform(0.0, 4.0)
            fraud_location_change[i] = np.random.choice([0, 1], p=[0.35, 0.65])
            fraud_hours[i] = np.random.randint(0, 24)
            fraud_account_age[i] = np.random.uniform(0.5, 12.0)
            fraud_chargebacks[i] = 0
            
        else: # GEO_ANOMALY / STEALTH
            # Stealth fraud mimicking low/medium amounts
            is_stealth = np.random.rand() < 0.25
            if is_stealth:
                mult = np.random.uniform(1.2, 2.5)
                fraud_amounts[i] = fraud_prev_avg[i] * mult
                fraud_frequency[i] = np.random.choice([1, 2, 3], p=[0.6, 0.3, 0.1])
                fraud_failed[i] = np.random.choice([0, 1], p=[0.8, 0.2])
                fraud_device_age[i] = np.random.uniform(2.0, 30.0)
                fraud_location_change[i] = np.random.choice([0, 1], p=[0.4, 0.6])
                fraud_hours[i] = np.random.randint(0, 24)
                fraud_account_age[i] = np.random.uniform(30, 300)
                fraud_chargebacks[i] = 0
            else:
                fraud_amounts[i] = np.random.uniform(350.0, 4200.0)
                fraud_frequency[i] = np.random.randint(1, 5)
                fraud_failed[i] = np.random.choice([0, 1, 2, 3], p=[0.2, 0.4, 0.3, 0.1])
                fraud_device_age[i] = np.random.uniform(0.0, 8.0)
                fraud_location_change[i] = 1
                fraud_hours[i] = np.random.choice([0, 1, 2, 3, 4, 5, 21, 22, 23], p=[0.12, 0.12, 0.12, 0.12, 0.12, 0.1, 0.1, 0.1, 0.1])
                fraud_account_age[i] = np.random.uniform(10, 400)
                fraud_chargebacks[i] = np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1])

    fraud_is_new_device = (fraud_device_age <= 2.0).astype(int)
    
    df_fraud = pd.DataFrame({
        'amount': np.round(fraud_amounts, 2),
        'previous_average': np.round(fraud_prev_avg, 2),
        'transaction_frequency': fraud_frequency,
        'failed_transactions': fraud_failed,
        'device_age': np.round(fraud_device_age, 1),
        'is_new_device': fraud_is_new_device,
        'location_change': fraud_location_change,
        'transaction_hour': fraud_hours,
        'account_age': np.round(fraud_account_age, 1),
        'previous_chargebacks': fraud_chargebacks,
        'is_fraud': 1
    })
    
    df = pd.concat([df_legit, df_fraud], ignore_index=True)
    
    # Compute calculated ratio feature
    df['amount_to_avg_ratio'] = np.round(df['amount'] / np.maximum(df['previous_average'], 1.0), 3)
    
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)
    return df

def get_train_test_splits(
    n_samples: int = 12000, 
    test_size: float = 0.1667, 
    random_seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Generates 10,000 train samples and 2,000 held-out test samples."""
    df = generate_synthetic_transactions(n_samples=n_samples, fraud_ratio=0.13, random_seed=random_seed)
    
    split_idx = int(len(df) * (1.0 - test_size))
    df_train = df.iloc[:split_idx].copy().reset_index(drop=True)
    df_test = df.iloc[split_idx:].copy().reset_index(drop=True)
    
    return df_train, df_test

if __name__ == "__main__":
    train_df, test_df = get_train_test_splits()
    print(f"Generated synthetic training set: {len(train_df)} rows, test set: {len(test_df)} rows")
    print(f"Train fraud rate: {train_df['is_fraud'].mean():.2%}, Test fraud rate: {test_df['is_fraud'].mean():.2%}")
