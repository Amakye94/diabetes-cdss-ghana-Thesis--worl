from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ml.prediction_service import predict_diabetes_risk
from ml.xai.shap_service import explain_prediction

from ..database import get_db
from ..models import (
    ClinicalAssessment,
    Patient,
    Prediction,
    PredictionExplanation,
    User,
)
from ..schemas import ClinicalAssessmentCreate
from ..auth.dependencies import get_current_user


router = APIRouter(
    prefix="/api/v1/assessments",
    tags=["Clinical Assessments"]
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def create_assessment(
    assessment_data: ClinicalAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        # -----------------------------------------------------
        # 1. Check that patient exists
        # -----------------------------------------------------

        patient = (
            db.query(Patient)
            .filter(
                Patient.id == assessment_data.patient_id
            )
            .first()
        )

        if not patient:
            raise HTTPException(
                status_code=404,
                detail="Patient not found."
            )


        # -----------------------------------------------------
        # 2. Validate height and weight
        # -----------------------------------------------------

        if assessment_data.height_cm <= 0:
            raise HTTPException(
                status_code=400,
                detail="Height must be greater than zero."
            )

        if assessment_data.weight_kg <= 0:
            raise HTTPException(
                status_code=400,
                detail="Weight must be greater than zero."
            )


        # -----------------------------------------------------
        # 3. Calculate BMI
        # -----------------------------------------------------

        height_m = assessment_data.height_cm / 100

        bmi = round(
            assessment_data.weight_kg / (height_m ** 2),
            2
        )


        # -----------------------------------------------------
        # 4. Create clinical assessment
        # -----------------------------------------------------

        assessment = ClinicalAssessment(

            patient_id=assessment_data.patient_id,

            assessed_by=current_user.id,

            age_years=assessment_data.age_years,

            height_cm=assessment_data.height_cm,

            weight_kg=assessment_data.weight_kg,

            bmi_kg_m2=bmi,

            waist_cm=assessment_data.waist_cm,

            mean_systolic_bp_mmhg=(
                assessment_data.mean_systolic_bp_mmhg
            ),

            mean_diastolic_bp_mmhg=(
                assessment_data.mean_diastolic_bp_mmhg
            ),

            current_smoking=(
                assessment_data.current_smoking
            ),

            alcohol_past_12_months=(
                assessment_data.alcohol_past_12_months
            ),

            fruit_servings_per_day=(
                assessment_data.fruit_servings_per_day
            ),

            vegetable_servings_per_day=(
                assessment_data.vegetable_servings_per_day
            ),

            vigorous_work_activity=(
                assessment_data.vigorous_work_activity
            ),

            moderate_work_activity=(
                assessment_data.moderate_work_activity
            ),

            active_transport=(
                assessment_data.active_transport
            ),

            vigorous_leisure_activity=(
                assessment_data.vigorous_leisure_activity
            ),

            moderate_leisure_activity=(
                assessment_data.moderate_leisure_activity
            ),
        )

        db.add(assessment)

        # Flush sends the INSERT to PostgreSQL so that
        # assessment.id becomes available, but does NOT commit.
        db.flush()


        # -----------------------------------------------------
        # 5. Run AI prediction
        # -----------------------------------------------------

        prediction_result = predict_diabetes_risk(

            age_years=assessment.age_years,

            sex_male=(
                1
                if patient.sex.lower() == "male"
                else 0
            ),

            bmi_kg_m2=assessment.bmi_kg_m2,

            waist_cm=assessment.waist_cm,

            mean_systolic_bp_mmhg=(
                assessment.mean_systolic_bp_mmhg
            ),

            mean_diastolic_bp_mmhg=(
                assessment.mean_diastolic_bp_mmhg
            ),

            current_smoking=(
                assessment.current_smoking
            ),

            alcohol_past_12_months=(
                assessment.alcohol_past_12_months
            ),

            fruit_servings_per_day=(
                assessment.fruit_servings_per_day
            ),

            vegetable_servings_per_day=(
                assessment.vegetable_servings_per_day
            ),

            vigorous_work_activity=(
                assessment.vigorous_work_activity
            ),

            moderate_work_activity=(
                assessment.moderate_work_activity
            ),

            active_transport=(
                assessment.active_transport
            ),

            vigorous_leisure_activity=(
                assessment.vigorous_leisure_activity
            ),

            moderate_leisure_activity=(
                assessment.moderate_leisure_activity
            ),
        )


        # -----------------------------------------------------
        # 6. Create prediction
        # -----------------------------------------------------

        prediction = Prediction(

            assessment_id=assessment.id,

            prediction_score=(
                prediction_result["prediction_score"]
            ),

            classification=(
                prediction_result["classification"]
            ),

            threshold=(
                prediction_result["threshold"]
            ),

            model_name=(
                prediction_result["model_name"]
            ),

            model_version=(
                prediction_result["model_version"]
            ),
        )

        db.add(prediction)

        # Get prediction.id without committing
        db.flush()


        # -----------------------------------------------------
        # 7. Generate SHAP explanation
        # -----------------------------------------------------

        shap_explanations = explain_prediction(

            age_years=assessment.age_years,

            sex_male=(
                1
                if patient.sex.lower() == "male"
                else 0
            ),

            bmi_kg_m2=assessment.bmi_kg_m2,

            waist_cm=assessment.waist_cm,

            mean_systolic_bp_mmhg=(
                assessment.mean_systolic_bp_mmhg
            ),

            mean_diastolic_bp_mmhg=(
                assessment.mean_diastolic_bp_mmhg
            ),

            current_smoking=(
                assessment.current_smoking
            ),

            alcohol_past_12_months=(
                assessment.alcohol_past_12_months
            ),

            fruit_servings_per_day=(
                assessment.fruit_servings_per_day
            ),

            vegetable_servings_per_day=(
                assessment.vegetable_servings_per_day
            ),

            vigorous_work_activity=(
                assessment.vigorous_work_activity
            ),

            moderate_work_activity=(
                assessment.moderate_work_activity
            ),

            active_transport=(
                assessment.active_transport
            ),

            vigorous_leisure_activity=(
                assessment.vigorous_leisure_activity
            ),

            moderate_leisure_activity=(
                assessment.moderate_leisure_activity
            ),
        )


        # -----------------------------------------------------
        # 8. Save SHAP explanations
        # -----------------------------------------------------

        for explanation in shap_explanations:

            explanation_record = PredictionExplanation(

                prediction_id=prediction.id,

                feature=explanation["feature"],

                feature_value=(
                    explanation["feature_value"]
                ),

                shap_value=(
                    explanation["shap_value"]
                ),

                direction=(
                    explanation["direction"]
                ),
            )

            db.add(explanation_record)


        # -----------------------------------------------------
        # 9. Commit EVERYTHING together
        # -----------------------------------------------------

        db.commit()


        # Refresh objects after successful commit
        db.refresh(assessment)
        db.refresh(prediction)


        # -----------------------------------------------------
        # 10. Return complete result
        # -----------------------------------------------------

        return {

            "assessment": {

                "id": assessment.id,

                "patient_id": assessment.patient_id,

                "assessed_by": assessment.assessed_by,

                "age_years": assessment.age_years,

                "height_cm": assessment.height_cm,

                "weight_kg": assessment.weight_kg,

                "bmi_kg_m2": assessment.bmi_kg_m2,

                "waist_cm": assessment.waist_cm,

                "mean_systolic_bp_mmhg": (
                    assessment.mean_systolic_bp_mmhg
                ),

                "mean_diastolic_bp_mmhg": (
                    assessment.mean_diastolic_bp_mmhg
                ),

                "current_smoking": (
                    assessment.current_smoking
                ),

                "alcohol_past_12_months": (
                    assessment.alcohol_past_12_months
                ),

                "fruit_servings_per_day": (
                    assessment.fruit_servings_per_day
                ),

                "vegetable_servings_per_day": (
                    assessment.vegetable_servings_per_day
                ),

                "vigorous_work_activity": (
                    assessment.vigorous_work_activity
                ),

                "moderate_work_activity": (
                    assessment.moderate_work_activity
                ),

                "active_transport": (
                    assessment.active_transport
                ),

                "vigorous_leisure_activity": (
                    assessment.vigorous_leisure_activity
                ),

                "moderate_leisure_activity": (
                    assessment.moderate_leisure_activity
                ),
            },


            "prediction": {

                "id": prediction.id,

                "prediction_score": (
                    prediction.prediction_score
                ),

                "classification": (
                    prediction.classification
                ),

                "threshold": (
                    prediction.threshold
                ),

                "model_name": (
                    prediction.model_name
                ),

                "model_version": (
                    prediction.model_version
                ),
            },


            "explanations": shap_explanations
        }


    except HTTPException:

        # Roll back the transaction for expected API errors
        db.rollback()

        raise


    except Exception as error:

        # Roll back EVERYTHING if any unexpected error occurs
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Assessment processing failed: {str(error)}"
        )
        
        
# =========================================================
# GET PATIENT ASSESSMENT HISTORY
# =========================================================

@router.get(
    "/patient/{patient_id}"
)
def get_patient_assessment_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found."
        )

    assessments = (
        db.query(ClinicalAssessment)
        .filter(
            ClinicalAssessment.patient_id == patient_id
        )
        .order_by(
            ClinicalAssessment.assessment_date.desc()
        )
        .all()
    )

    results = []

    for assessment in assessments:

        prediction = (
            db.query(Prediction)
            .filter(
                Prediction.assessment_id == assessment.id
            )
            .first()
        )

        results.append({

            "assessment_id": assessment.id,

            "assessment_date": (
                assessment.assessment_date
            ),

            "assessed_by": assessment.assessed_by,

            "age_years": assessment.age_years,

            "bmi_kg_m2": assessment.bmi_kg_m2,

            "waist_cm": assessment.waist_cm,

            "mean_systolic_bp_mmhg": (
                assessment.mean_systolic_bp_mmhg
            ),

            "mean_diastolic_bp_mmhg": (
                assessment.mean_diastolic_bp_mmhg
            ),

            "prediction": (
                {
                    "prediction_score": (
                        prediction.prediction_score
                    ),
                    "classification": (
                        prediction.classification
                    ),
                    "threshold": (
                        prediction.threshold
                    ),
                    "model_name": (
                        prediction.model_name
                    ),
                    "model_version": (
                        prediction.model_version
                    )
                }
                if prediction
                else None
            )
        })

    return {
        "patient_id": patient_id,
        "total_assessments": len(results),
        "assessments": results
    }
    
    
# =========================================================
# GET COMPLETE ASSESSMENT RESULT
# =========================================================

@router.get(
    "/{assessment_id}"
)
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    assessment = (
        db.query(ClinicalAssessment)
        .filter(
            ClinicalAssessment.id == assessment_id
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found."
        )

    prediction = (
        db.query(Prediction)
        .filter(
            Prediction.assessment_id == assessment.id
        )
        .first()
    )

    explanations = []

    if prediction:

        explanations = (
            db.query(PredictionExplanation)
            .filter(
                PredictionExplanation.prediction_id
                == prediction.id
            )
            .order_by(
                PredictionExplanation.id
            )
            .all()
        )

    return {

        "assessment": {

            "id": assessment.id,

            "patient_id": assessment.patient_id,

            "assessed_by": assessment.assessed_by,

            "assessment_date": (
                assessment.assessment_date
            ),

            "age_years": assessment.age_years,

            "height_cm": assessment.height_cm,

            "weight_kg": assessment.weight_kg,

            "bmi_kg_m2": assessment.bmi_kg_m2,

            "waist_cm": assessment.waist_cm,

            "mean_systolic_bp_mmhg": (
                assessment.mean_systolic_bp_mmhg
            ),

            "mean_diastolic_bp_mmhg": (
                assessment.mean_diastolic_bp_mmhg
            ),

            "current_smoking": (
                assessment.current_smoking
            ),

            "alcohol_past_12_months": (
                assessment.alcohol_past_12_months
            ),

            "fruit_servings_per_day": (
                assessment.fruit_servings_per_day
            ),

            "vegetable_servings_per_day": (
                assessment.vegetable_servings_per_day
            ),

            "vigorous_work_activity": (
                assessment.vigorous_work_activity
            ),

            "moderate_work_activity": (
                assessment.moderate_work_activity
            ),

            "active_transport": (
                assessment.active_transport
            ),

            "vigorous_leisure_activity": (
                assessment.vigorous_leisure_activity
            ),

            "moderate_leisure_activity": (
                assessment.moderate_leisure_activity
            )
        },

        "prediction": (
            {
                "id": prediction.id,
                "prediction_score": (
                    prediction.prediction_score
                ),
                "classification": (
                    prediction.classification
                ),
                "threshold": prediction.threshold,
                "model_name": prediction.model_name,
                "model_version": prediction.model_version
            }
            if prediction
            else None
        ),

        "explanations": [
            {
                "feature": explanation.feature,
                "feature_value": (
                    explanation.feature_value
                ),
                "shap_value": (
                    explanation.shap_value
                ),
                "direction": (
                    explanation.direction
                )
            }
            for explanation in explanations
        ]
    }