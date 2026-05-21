"""
Inference module for trained Resume Scoring Model.

Loads the trained model and provides predictions on new resume data.
"""

import os
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Tuple
from resume_scorer import ResumeScorer


class ResumeModelInference:
    """Inference pipeline for resume scoring model."""

    def __init__(self, model_path: str = "resume_model.pkl"):
        """Load trained model and scaler."""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")

        print(f"Loading model from {model_path}...")
        with open(model_path, "rb") as f:
            model_data = pickle.load(f)

        self.model = model_data["model"]
        self.scaler = model_data["scaler"]
        self.feature_names = model_data["features"]
        self.scorer = ResumeScorer()
        print("✓ Model loaded successfully")

    def extract_features(self, text: str) -> np.ndarray:
        """Extract features from a single resume text."""
        if not text or text == "":
            features = np.zeros(len(self.feature_names))
        else:
            features_raw = self.scorer.extract_features(str(text))
            features_dict = {
                "word_count": features_raw["word_count"],
                "sections_count": features_raw["sections_count"],
                "skills_count": features_raw["skills_count"],
                "action_verbs_count": features_raw["action_verbs_count"],
                "metrics_count": features_raw["metrics_count"],
                "contact_info_score": (
                    features_raw["has_email"] * 1
                    + features_raw["has_phone"] * 1
                    + features_raw["has_linkedin"] * 0.5
                    + features_raw["has_github"] * 0.5
                ),
                "bullet_points": features_raw["bullet_points"],
            }
            features = np.array([features_dict[f] for f in self.feature_names])

        return features

    def predict(self, text: str) -> Dict:
        """Predict resume score and get feedback."""
        # Extract features
        features = self.extract_features(text).reshape(1, -1)

        # Scale features
        features_scaled = self.scaler.transform(features)

        # Predict
        ml_score = float(self.model.predict(features_scaled)[0])
        ml_score = max(0, min(100, ml_score))  # Clamp to 0-100

        # Get rule-based score for comparison
        rule_score = self.scorer.score(text)

        # Generate feedback
        feedback = self.scorer.generate_feedback(text, ml_score)

        return {
            "ml_score": round(ml_score, 1),
            "rule_score": rule_score,
            "average_score": round((ml_score + rule_score) / 2, 1),
            "feedback": feedback,
            "model_type": "Hybrid (ML + Rule-based)",
        }

    def predict_batch(self, texts: list) -> list:
        """Predict scores for multiple resumes."""
        results = []
        for i, text in enumerate(texts):
            print(f"Processing resume {i+1}/{len(texts)}...", end="\r")
            results.append(self.predict(text))
        print("✓ Batch processing complete" + " " * 40)
        return results


def main():
    """Example usage of inference pipeline."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "resume_model.pkl")

    # Load model
    inference = ResumeModelInference(model_path)

    # Example resume text
    sample_resume = """
    Senior Software Engineer with 5+ years of experience in Python, Java, and distributed systems.

    PROFESSIONAL SUMMARY
    Passionate software engineer with proven track record in developing scalable backend systems.
    Strong expertise in cloud technologies and microservices architecture.

    SKILLS
    - Python, Java, C++
    - Django, Spring Boot, Node.js
    - AWS, Docker, Kubernetes
    - PostgreSQL, MongoDB, Redis
    - Machine Learning, TensorFlow, PyTorch

    EXPERIENCE
    Software Engineer at TechCorp (2019-Present)
    - Developed microservices architecture reducing response time by 40%
    - Led team of 5 engineers in building data pipeline processing 10M events/day
    - Implemented ML model for fraud detection improving accuracy to 99.2%

    Senior Developer at StartupXYZ (2017-2019)
    - Built REST API serving 1M+ requests daily
    - Optimized database queries reducing load time by 50%

    EDUCATION
    B.Tech in Computer Science from IIT Delhi (2017)

    CERTIFICATIONS
    - AWS Solutions Architect Associate
    - Kubernetes Administrator

    GitHub: github.com/example
    LinkedIn: linkedin.com/in/example
    """

    # Get prediction
    print("\n" + "=" * 60)
    print("RESUME SCORING - INFERENCE")
    print("=" * 60)
    print("\nProcessing sample resume...")
    result = inference.predict(sample_resume)

    print("\n" + "-" * 60)
    print("PREDICTION RESULTS")
    print("-" * 60)
    print(f"ML-based Score:        {result['ml_score']}/100")
    print(f"Rule-based Score:      {result['rule_score']}/100")
    print(f"Average Score:         {result['average_score']}/100")
    print(f"Overall Rating:        {result['feedback']['overall']}")

    print("\n" + "-" * 60)
    print("STRENGTHS")
    print("-" * 60)
    for strength in result["feedback"]["strengths"]:
        print(f"  ✓ {strength}")

    print("\n" + "-" * 60)
    print("IMPROVEMENTS")
    print("-" * 60)
    for improvement in result["feedback"]["improvements"]:
        print(f"  ⚠ {improvement}")

    if result["feedback"]["missing_sections"]:
        print("\n" + "-" * 60)
        print("MISSING SECTIONS")
        print("-" * 60)
        for section in result["feedback"]["missing_sections"]:
            print(f"  ✗ {section}")


if __name__ == "__main__":
    main()
