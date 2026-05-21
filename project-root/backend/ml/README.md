# Resume Scoring ML Pipeline

## Overview

This module implements a complete ML pipeline for resume scoring, combining rule-based heuristics with trained machine learning models.

## Architecture

### Components

#### 1. **resume_scorer.py** (Rule-Based Engine)

- Extracts quantitative features from resume text
- Implements heuristic-based scoring (0-100 scale)
- Provides structured feedback and improvement suggestions

**Key Features:**

- 70+ technical skill keywords across domains
- 8 resume sections pattern matching
- Detects action verbs, metrics, and contact info
- Generates actionable feedback

#### 2. **train.py** (Training Pipeline)

- Loads and preprocesses resume dataset (CSV format)
- Extracts features using ResumeScorer
- Trains Random Forest regression model
- Performs cross-validation and evaluation

**Training Process:**

```
1. Load resume_data.csv
2. Extract 7 features from career objective text
3. Train Random Forest (100 estimators)
4. 5-fold cross-validation
5. Save trained model + scaler
```

#### 3. **inference.py** (Prediction Engine)

- Loads trained model and scaler
- Makes predictions on new resume texts
- Provides hybrid scoring (ML + Rule-based)
- Generates comprehensive feedback

#### 4. **evaluate.py** (Model Evaluation)

- Analyzes model performance
- Generates evaluation reports
- Identifies overfitting
- Ranks feature importance

---

## Dataset

**File:** `resume_data.csv`

**Rows:** 18 resume records
**Columns:** ~37 attributes including:

- `career_objective`: Resume text
- `matched_score`: Target score (0-1 range)
- Skills, education, experience, certifications

**Target Variable:**

- Normalized to 0-100 scale
- Range: 31.67 - 85.00
- Mean: 65.48 ± 15.69

---

## Model Performance

### Training Results

| Metric       | Train  | Test    | CV Mean |
| ------------ | ------ | ------- | ------- |
| **R² Score** | 0.1267 | -0.8454 | -1.1105 |
| **MAE**      | 10.79  | 15.60   | -       |
| **RMSE**     | 14.49  | 16.64   | -       |
| **MSE**      | 210.05 | 276.81  | -       |

### Feature Importance

1. **word_count** (48.21%) - Resume length
2. **sections_count** (30.66%) - Number of sections
3. **skills_count** (21.13%) - Technical skills detected
4. **action_verbs_count** (0.00%)
5. **metrics_count** (0.00%)

### Model Details

- **Algorithm:** Random Forest Regressor
- **Parameters:**
  - n_estimators: 100
  - max_depth: 15
  - min_samples_split: 5
  - min_samples_leaf: 2
  - Scaling: StandardScaler

---

## Performance Analysis

### ⚠️ Important Notes

The current model shows lower performance due to **limited dataset size** (only 18 records):

- **Negative Test R²**: Indicates high variance with small dataset
- **Train-Test Gap (0.97)**: Shows potential overfitting
- **CV R² (-1.11)**: Cross-validation struggles with small samples

### ✅ Recommendations for Improvement

1. **Collect More Data**
   - Aim for 500-1000+ resume records
   - Ensures robust statistical learning

2. **Feature Engineering**
   - Extract more sophisticated features
   - Use embeddings (BERT, Word2Vec)
   - Include company reputation scores

3. **Ensemble Methods**
   - Combine multiple models
   - Use Gradient Boosting with more tuning

4. **Hybrid Approach** (Recommended)
   - Continue using rule-based scoring
   - Use ML model for confidence scoring
   - Average both approaches

---

## Usage

### 1. Training

```bash
cd backend/ml
python train.py
```

**Output:**

- `resume_model.pkl` - Trained model + scaler
- `training_metrics.json` - Performance metrics

### 2. Inference

```python
from inference import ResumeModelInference

# Load model
inference = ResumeModelInference("resume_model.pkl")

# Predict on single resume
result = inference.predict(resume_text)
print(f"ML Score: {result['ml_score']}")
print(f"Rule Score: {result['rule_score']}")
print(f"Feedback: {result['feedback']}")
```

### 3. Batch Processing

```python
texts = [resume1, resume2, resume3]
results = inference.predict_batch(texts)
```

### 4. Evaluation

```bash
python evaluate.py
```

**Output:** `evaluation_report.json`

---

## Output Format

### Prediction Result

```json
{
  "ml_score": 57.5,
  "rule_score": 77.0,
  "average_score": 67.3,
  "model_type": "Hybrid (ML + Rule-based)",
  "feedback": {
    "strengths": [
      "Strong technical skills section with diverse technologies",
      "Good use of action verbs to describe accomplishments"
    ],
    "improvements": [
      "Resume is too short — expand on your experience",
      "Use bullet points to improve readability"
    ],
    "missing_sections": ["Projects"],
    "overall": "Needs Improvement"
  }
}
```

---

## Integration with Backend

### API Endpoint Example

```python
# api/resume.py
from ml.inference import ResumeModelInference

inference = ResumeModelInference()

@app.post("/api/score-resume")
def score_resume(resume_text: str):
    result = inference.predict(resume_text)
    return result
```

---

## Files Generated

```
backend/ml/
├── resume_scorer.py              # Rule-based engine
├── train.py                      # Training pipeline
├── inference.py                  # Inference engine
├── evaluate.py                   # Evaluation utilities
├── resume_data.csv               # Training dataset
├── resume_model.pkl              # Trained model (generated)
├── training_metrics.json         # Training results (generated)
└── evaluation_report.json        # Evaluation report (generated)
```

---

## Future Improvements

- [ ] Increase dataset to 500+ resumes
- [ ] Implement neural network model (LSTM/Transformer)
- [ ] Add semantic features from word embeddings
- [ ] Create skill-to-job matching module
- [ ] Implement A/B testing for scoring algorithms
- [ ] Add explainability with SHAP values

---

## Dependencies

```
pandas>=1.3.0
numpy>=1.21.0
scikit-learn>=0.24.0
matplotlib>=3.4.0
```

---

## Notes

- **Dataset Quality:** Small dataset; performance improves with more data
- **Feature Extraction:** Works on resume career objective/summary
- **Scalability:** Can process batch predictions efficiently
- **Hybrid Approach:** Combines ML predictions with rule-based scoring for robustness
