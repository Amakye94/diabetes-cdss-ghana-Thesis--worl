from pathlib import Path

import joblib
import pandas as pd
import shap


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "FINAL_diabetes_logistic_regression.joblib"
)

FEATURES_PATH = (
    BASE_DIR
    / "models"
    / "FINAL_diabetes_model_features.joblib"
)

BACKGROUND_PATH = (
    BASE_DIR
    / "xai"
    / "shap_background.csv"
)


# ============================================================
# LOAD MODEL AND FEATURES
# ============================================================

pipeline = joblib.load(MODEL_PATH)

FEATURES = joblib.load(FEATURES_PATH)

background = pd.read_csv(BACKGROUND_PATH)

# Ensure the background follows the exact model feature order
background = background[FEATURES]


# ============================================================
# MODEL COMPONENTS
# ============================================================

scaler = pipeline.named_steps["scaler"]

logistic_model = pipeline.named_steps["model"]


# ============================================================
# PREPARE SHAP BACKGROUND
# ============================================================

background_scaled = scaler.transform(background)

masker = shap.maskers.Independent(
    background_scaled,
    max_samples=len(background_scaled)
)

explainer = shap.LinearExplainer(
    logistic_model,
    masker
)


# ============================================================
# EXPLANATION FUNCTION
# ============================================================

def explain_prediction(
    age_years: float,
    sex_male: int,
    bmi_kg_m2: float,
    waist_cm: float,
    mean_systolic_bp_mmhg: float,
    mean_diastolic_bp_mmhg: float,
    current_smoking: int,
    alcohol_past_12_months: int,
    fruit_servings_per_day: float,
    vegetable_servings_per_day: float,
    vigorous_work_activity: int,
    moderate_work_activity: int,
    active_transport: int,
    vigorous_leisure_activity: int,
    moderate_leisure_activity: int,
):

    input_data = pd.DataFrame([{
        "age_years": age_years,
        "sex_male": sex_male,
        "bmi_kg_m2": bmi_kg_m2,
        "waist_cm": waist_cm,
        "mean_systolic_bp_mmhg": mean_systolic_bp_mmhg,
        "mean_diastolic_bp_mmhg": mean_diastolic_bp_mmhg,
        "current_smoking": current_smoking,
        "alcohol_past_12_months": alcohol_past_12_months,
        "fruit_servings_per_day": fruit_servings_per_day,
        "vegetable_servings_per_day": vegetable_servings_per_day,
        "vigorous_work_activity": vigorous_work_activity,
        "moderate_work_activity": moderate_work_activity,
        "active_transport": active_transport,
        "vigorous_leisure_activity": vigorous_leisure_activity,
        "moderate_leisure_activity": moderate_leisure_activity,
    }])

    # Ensure exact model feature order
    input_data = input_data[FEATURES]

    # Apply the same scaler used by the trained model
    scaled_input = scaler.transform(input_data)

    # Calculate SHAP values
    shap_result = explainer(scaled_input)

    shap_values = shap_result.values[0]

    explanations = []

    for feature, value, shap_value in zip(
        FEATURES,
        input_data.iloc[0].values,
        shap_values
    ):

        if shap_value > 0:
            direction = "toward_positive"

        elif shap_value < 0:
            direction = "away_from_positive"

        else:
            direction = "neutral"

        explanations.append({
            "feature": feature,
            "feature_value": float(value),
            "shap_value": float(shap_value),
            "direction": direction
        })

    # Most influential features first
    explanations.sort(
        key=lambda item: abs(item["shap_value"]),
        reverse=True
    )

    return explanations