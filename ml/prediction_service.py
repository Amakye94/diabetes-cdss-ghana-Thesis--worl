from pathlib import Path

import joblib
import pandas as pd


# =========================================================
# MODEL PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

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


# =========================================================
# LOAD MODEL
# =========================================================

model = joblib.load(MODEL_PATH)

FEATURES = joblib.load(FEATURES_PATH)


# =========================================================
# PREDICTION FUNCTION
# =========================================================

def predict_diabetes_risk(
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
    """
    Generate a diabetes prediction using the final
    Logistic Regression model.
    """

    # -----------------------------------------------------
    # Prepare input data
    # -----------------------------------------------------

    input_data = pd.DataFrame(
        [{
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
        }]
    )


    # -----------------------------------------------------
    # Ensure exact feature order
    # -----------------------------------------------------

    input_data = input_data[FEATURES]


    # -----------------------------------------------------
    # Generate prediction score
    # -----------------------------------------------------

    prediction_score = model.predict_proba(
        input_data
    )[0][1]


    # -----------------------------------------------------
    # Apply model threshold
    # -----------------------------------------------------

    threshold = 0.50

    classification = int(
        prediction_score >= threshold
    )


    # -----------------------------------------------------
    # Return result
    # -----------------------------------------------------

    return {
        "prediction_score": float(prediction_score),
        "classification": classification,
        "threshold": threshold,
        "model_name": "Logistic Regression",
        "model_version": "FINAL_1.0"
    }
    