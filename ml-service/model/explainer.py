"""
RiskGuard AI — Risk Factor Attribution & Explainer Engine
Extracts concrete, human-readable risk factors from transaction features and historical baselines.
"""

from typing import List, Dict, Any

class RiskFactorExplainer:
    """
    Generates explainable, deterministic risk factors based on feature thresholds,
    customer baseline deviations, and anomaly indicators.
    """
    
    @staticmethod
    def explain(features: Dict[str, Any], fraud_prob: float) -> List[str]:
        factors: List[str] = []
        
        amount = float(features.get('amount', 0.0))
        prev_avg = float(features.get('previous_average', 0.0))
        freq = int(features.get('transaction_frequency', 0))
        failed = int(features.get('failed_transactions', 0))
        device_age = float(features.get('device_age', 30.0))
        is_new_device = bool(features.get('is_new_device', device_age <= 2))
        location_change = bool(features.get('location_change', False))
        hour = int(features.get('transaction_hour', 12))
        account_age = float(features.get('account_age', 100.0))
        chargebacks = int(features.get('previous_chargebacks', 0))
        
        # 1. Amount to Previous Average Ratio
        if prev_avg > 0:
            ratio = amount / prev_avg
            if ratio >= 6.0:
                factors.append(
                    f"Transaction amount (${amount:,.2f}) is significantly anomalous — {ratio:.1f}x higher than the customer's typical average (${prev_avg:,.2f})."
                )
            elif ratio >= 3.0:
                factors.append(
                    f"Transaction amount (${amount:,.2f}) is substantially above the historical average (${prev_avg:,.2f}) [{ratio:.1f}x deviation]."
                )
            elif ratio >= 2.0 and amount >= 500:
                factors.append(
                    f"Transaction amount (${amount:,.2f}) represents a noticeable 2x elevation over usual spending (${prev_avg:,.2f})."
                )
        elif amount >= 3000:
            factors.append(f"High absolute transaction value (${amount:,.2f}) with limited historical baseline data.")

        # 2. Device Novelty & Fingerprint
        if is_new_device or device_age <= 1.0:
            factors.append(
                f"Brand new device fingerprint detected (first observed {device_age:.1f} days ago; account takeover risk)."
            )
        elif device_age <= 5.0 and fraud_prob > 0.4:
            factors.append(
                f"Recently bound device (age: {device_age:.1f} days) initiating high-value activity."
            )

        # 3. Geolocation & Travel Anomaly
        if location_change:
            factors.append(
                "Geographic anomaly detected: Transaction originated from an unusual location differing from customer's primary region."
            )

        # 4. Velocity & Frequency Spike
        if freq >= 5:
            factors.append(
                f"Severe velocity spike: {freq} transactions initiated within the last 10 minutes (potential automated bot/card-testing attack)."
            )
        elif freq >= 3:
            factors.append(
                f"Elevated transaction frequency: {freq} transactions in the last 10 minutes."
            )

        # 5. Failed Authentication & CVV/PIN Attempts
        if failed >= 3:
            factors.append(
                f"High authentication failure rate: {failed} failed credential/CVV/PIN attempts recorded prior to this transaction."
            )
        elif failed >= 1:
            factors.append(
                f"Prior authentication friction: {failed} failed attempt(s) detected during recent payment attempts."
            )

        # 6. Account Maturity / Dormancy
        if account_age <= 3.0:
            factors.append(
                f"Brand new customer account (age: {account_age:.1f} days) transacting large amounts immediately after onboarding."
            )
        elif account_age <= 14.0 and (amount >= 1000 or is_new_device):
            factors.append(
                f"Young account maturity profile ({account_age:.1f} days old) paired with elevated risk features."
            )

        # 7. Chargeback & Dispute History
        if chargebacks >= 2:
            factors.append(
                f"High-risk account dispute history: {chargebacks} previous chargebacks/disputes on record for this customer ID."
            )
        elif chargebacks == 1:
            factors.append(
                "Historical chargeback flagged on this customer profile."
            )

        # 8. Off-Hours Timing
        if (hour in [1, 2, 3, 4]) and (location_change or is_new_device or amount >= 1000):
            factors.append(
                f"Unusual transaction timing: Payment initiated at {hour:02d}:00 off-peak hours alongside environmental risk indicators."
            )

        # Default fallback if no specific flags triggered but probability is low
        if not factors and fraud_prob < 0.35:
            factors.append("Transaction characteristics align with established customer behavioral profile.")
            factors.append("Known device and trusted geographic origin verified.")
            factors.append("No authentication failures or velocity anomalies detected.")
        elif not factors and fraud_prob >= 0.35:
            factors.append("Aggregated subtle risk indicators slightly elevated across multiple feature dimensions.")

        return factors
