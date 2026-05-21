"""
Model evaluation and testing utilities.

Provides comprehensive model evaluation, comparison, and testing functionality.
"""

import os
import json
import numpy as np
import pandas as pd
import pickle
from typing import Dict, List, Tuple
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, mean_absolute_percentage_error
import matplotlib.pyplot as plt


class ModelEvaluator:
    """Comprehensive model evaluation and analysis."""

    def __init__(self, model_path: str = "resume_model.pkl"):
        """Load model for evaluation."""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")

        with open(model_path, "rb") as f:
            model_data = pickle.load(f)

        self.model = model_data["model"]
        self.scaler = model_data["scaler"]
        self.feature_names = model_data["features"]

    def evaluate_predictions(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
        """Evaluate model predictions."""
        metrics = {
            "r2_score": r2_score(y_true, y_pred),
            "mae": mean_absolute_error(y_true, y_pred),
            "mse": mean_squared_error(y_true, y_pred),
            "rmse": np.sqrt(mean_squared_error(y_true, y_pred)),
            "mape": mean_absolute_percentage_error(y_true, y_pred),
        }

        # Additional metrics
        residuals = y_true - y_pred
        metrics["mean_residual"] = float(np.mean(residuals))
        metrics["std_residual"] = float(np.std(residuals))
        metrics["max_error"] = float(np.max(np.abs(residuals)))

        # Accuracy metrics (within tolerance)
        metrics["accuracy_within_5"] = float(np.mean(np.abs(residuals) <= 5))
        metrics["accuracy_within_10"] = float(np.mean(np.abs(residuals) <= 10))
        metrics["accuracy_within_15"] = float(np.mean(np.abs(residuals) <= 15))

        return metrics

    def generate_evaluation_report(self, metrics_path: str = "training_metrics.json") -> Dict:
        """Generate comprehensive evaluation report."""
        print("\n" + "=" * 60)
        print("MODEL EVALUATION REPORT")
        print("=" * 60)

        with open(metrics_path, "r") as f:
            metrics = json.load(f)

        test_metrics = metrics["test_metrics"]
        train_metrics = metrics["train_metrics"]
        cv_scores = metrics["cv_scores"]
        feature_importance = metrics["feature_importance"]

        report = {
            "model_type": "Random Forest Regressor",
            "training_summary": {
                "total_features": len(metrics["feature_importance"]),
                "top_features": list(feature_importance.items())[:5],
            },
            "performance": {
                "test": test_metrics,
                "train": train_metrics,
                "cross_validation": {
                    "mean_r2": float(np.mean(cv_scores)),
                    "std_r2": float(np.std(cv_scores)),
                    "all_folds": cv_scores,
                },
            },
            "overfitting_analysis": {
                "train_r2": train_metrics["r2"],
                "test_r2": test_metrics["r2"],
                "gap": abs(train_metrics["r2"] - test_metrics["r2"]),
                "status": "OK" if abs(train_metrics["r2"] - test_metrics["r2"]) < 0.1 else "WARNING",
            },
        }

        # Print report
        print("\n📊 PERFORMANCE METRICS")
        print("-" * 60)
        print(f"Test R² Score:         {test_metrics['r2']:.4f}")
        print(f"Train R² Score:        {train_metrics['r2']:.4f}")
        print(f"CV Mean R² Score:      {report['performance']['cross_validation']['mean_r2']:.4f}")
        print(f"\nTest MAE:              {test_metrics['mae']:.4f}")
        print(f"Test RMSE:             {test_metrics['rmse']:.4f}")
        print(f"Test MSE:              {test_metrics['mse']:.4f}")

        print("\n" + "-" * 60)
        print("🔍 OVERFITTING ANALYSIS")
        print("-" * 60)
        print(f"Train-Test Gap:        {report['overfitting_analysis']['gap']:.4f}")
        print(f"Status:                {report['overfitting_analysis']['status']}")

        print("\n" + "-" * 60)
        print("⭐ TOP 5 IMPORTANT FEATURES")
        print("-" * 60)
        for i, (feat, imp) in enumerate(report["training_summary"]["top_features"], 1):
            print(f"{i}. {feat:.<35} {float(imp):.4f}")

        return report


def run_model_tests():
    """Run comprehensive model tests."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "resume_model.pkl")
    metrics_path = os.path.join(script_dir, "training_metrics.json")

    # Initialize evaluator
    evaluator = ModelEvaluator(model_path)

    # Generate report
    report = evaluator.generate_evaluation_report(metrics_path)

    # Save report
    report_path = os.path.join(script_dir, "evaluation_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n✓ Evaluation report saved to {report_path}")

    # Print summary
    print("\n" + "=" * 60)
    print("✅ MODEL EVALUATION COMPLETE")
    print("=" * 60)
    print(f"\n📁 Generated files:")
    print(f"  • Evaluation Report: {report_path}")


if __name__ == "__main__":
    run_model_tests()
