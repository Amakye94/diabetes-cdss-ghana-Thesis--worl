import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AssessmentResult() {
    const navigate = useNavigate();

    const { patientId, assessmentId } = useParams();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAssessment();
    }, [assessmentId]);

    const loadAssessment = async () => {
        try {
            const token =
                localStorage.getItem("access_token");

            const response = await api.get(
                `/assessments/${assessmentId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Assessment result:",
                response.data
            );

            setResult(response.data);

        } catch (error) {
            console.error(
                "Assessment result error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem(
                    "access_token"
                );

                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.detail ||
                "Unable to load assessment result."
            );

        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">

                <div className="loading-spinner"></div>

                <p>
                    Loading AI assessment result...
                </p>

            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-loading">

                <p>{error}</p>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate(
                            `/patients/${patientId}`
                        )
                    }
                >
                    Back to Patient
                </button>

            </div>
        );
    }

    if (!result) {
        return null;
    }

    const assessment = result.assessment;
    const prediction = result.prediction;
    const explanations =
        result.explanations || [];

    const score =
        prediction?.prediction_score ?? 0;

    const percentage =
        (score * 100).toFixed(1);

    const classification =
        prediction?.classification;

    return (
        <div className="dashboard">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        D
                    </div>

                    <div>
                        <h2>
                            Diabetes CDSS
                        </h2>

                        <span>
                            Ghana
                        </span>
                    </div>

                </div>


                <nav className="sidebar-nav">

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span className="nav-icon">
                            ⌂
                        </span>

                        Dashboard
                    </button>


                    <button
                        className="nav-item active"
                        onClick={() =>
                            navigate("/patients")
                        }
                    >
                        <span className="nav-icon">
                            ♙
                        </span>

                        Patients
                    </button>


                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/patients/new")
                        }
                    >
                        <span className="nav-icon">
                            ＋
                        </span>

                        New Patient
                    </button>

                </nav>


                <div className="sidebar-bottom">

                    <button
                        className="logout-button"
                        onClick={() => {

                            localStorage.removeItem(
                                "access_token"
                            );

                            navigate("/login");

                        }}
                    >
                        Sign Out
                    </button>

                </div>

            </aside>


            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                <header className="dashboard-header">

                    <div>

                        <p className="page-label">
                            AI Clinical Assessment
                        </p>

                        <h1>
                            Assessment Result
                        </h1>

                        <p className="header-subtitle">
                            AI-assisted diabetes risk
                            assessment and explanation.
                        </p>

                    </div>


                    <button
                        className="secondary-action-button"
                        onClick={() =>
                            navigate(
                                `/patients/${patientId}`
                            )
                        }
                    >
                        ← Patient Profile
                    </button>

                </header>


                {/* PATIENT SUMMARY */}

                <section className="assessment-patient-card">

                    <div className="assessment-avatar">
                        P
                    </div>

                    <div>

                        <h2>
                            Patient Assessment
                        </h2>

                        <p>
                            Assessment ID:{" "}
                            {assessment?.id}
                        </p>

                    </div>

                </section>


                {/* AI RESULT */}

                <section className="result-card">

                    <div className="result-header">

                        <div>

                            <p className="result-label">
                                MODEL PREDICTION
                            </p>

                            <h2>
                                Diabetes Risk Assessment
                            </h2>

                        </div>

                        <div className="model-badge">
                            {prediction?.model_name}
                        </div>

                    </div>


                    <div className="prediction-content">

                        <div className="prediction-score">

                            <span>
                                Model Prediction Score
                            </span>

                            <strong>
                                {percentage}%
                            </strong>

                            <small>
                                Threshold:{" "}
                                {(
                                    prediction?.threshold *
                                    100
                                ).toFixed(0)}
                                %
                            </small>

                        </div>


                        <div
                            className={
                                classification === 1
                                    ? "prediction-status status-positive"
                                    : "prediction-status status-below"
                            }
                        >

                            <span>
                                Model Classification
                            </span>

                            <strong>
                                {classification === 1
                                    ? "At or above model threshold"
                                    : "Below model threshold"}
                            </strong>

                        </div>

                    </div>


                    <div className="clinical-disclaimer">

                        <strong>
                            Clinical Decision Support
                        </strong>

                        <p>
                            This AI output is intended
                            to support clinical decision-making.
                            It does not constitute a diagnosis
                            and should be interpreted by a
                            qualified healthcare professional
                            together with the patient's clinical
                            information.
                        </p>

                    </div>

                </section>


                {/* WHY THIS PREDICTION */}

                <section className="dashboard-section">

                    <div className="section-title">

                        <h2>
                            Why This Prediction?
                        </h2>

                        <p>
                            SHAP-based explanation of
                            the model output.
                        </p>

                    </div>


                    <div className="explanation-card">

                        {explanations.length === 0 ? (

                            <div className="empty-state">

                                <h3>
                                    No explanation available
                                </h3>

                            </div>

                        ) : (

                            explanations
                                .slice(0, 10)
                                .map(
                                    (
                                        explanation,
                                        index
                                    ) => (

                                        <div
                                            className="explanation-row"
                                            key={
                                                `${explanation.feature}-${index}`
                                            }
                                        >

                                            <div className="explanation-info">

                                                <strong>
                                                    {formatFeatureName(
                                                        explanation.feature
                                                    )}
                                                </strong>

                                                <span>
                                                    Value:{" "}
                                                    {formatFeatureValue(
                                                        explanation
                                                    )}
                                                </span>

                                            </div>


                                            <div className="explanation-contribution">

                                                <span
                                                    className={
                                                        explanation.shap_value >= 0
                                                            ? "contribution-positive"
                                                            : "contribution-negative"
                                                    }
                                                >
                                                    {explanation.shap_value >=
                                                    0
                                                        ? "Toward positive output"
                                                        : "Away from positive output"}
                                                </span>

                                                <strong>
                                                    {explanation.shap_value >=
                                                    0
                                                        ? "+"
                                                        : ""}
                                                    {Number(
                                                        explanation.shap_value
                                                    ).toFixed(4)}
                                                </strong>

                                            </div>

                                        </div>

                                    )
                                )

                        )}

                    </div>

                </section>


                {/* ASSESSMENT DATA */}

                <section className="dashboard-section">

                    <div className="section-title">

                        <h2>
                            Assessment Data
                        </h2>

                        <p>
                            Clinical information used
                            by the model.
                        </p>

                    </div>


                    <div className="result-data-grid">

                        <ResultData
                            label="Age"
                            value={`${assessment?.age_years} years`}
                        />

                        <ResultData
                            label="BMI"
                            value={`${assessment?.bmi_kg_m2?.toFixed
                                ? assessment.bmi_kg_m2.toFixed(2)
                                : assessment.bmi_kg_m2
                            } kg/m²`}
                        />

                        <ResultData
                            label="Waist"
                            value={`${assessment?.waist_cm} cm`}
                        />

                        <ResultData
                            label="Mean Systolic BP"
                            value={`${assessment?.mean_systolic_bp_mmhg} mmHg`}
                        />

                        <ResultData
                            label="Mean Diastolic BP"
                            value={`${assessment?.mean_diastolic_bp_mmhg} mmHg`}
                        />

                        <ResultData
                            label="Current Smoking"
                            value={
                                assessment?.current_smoking
                                    ? "Yes"
                                    : "No"
                            }
                        />

                        <ResultData
                            label="Alcohol"
                            value={
                                assessment?.alcohol_past_12_months
                                    ? "Yes"
                                    : "No"
                            }
                        />

                        <ResultData
                            label="Fruit"
                            value={`${assessment?.fruit_servings_per_day} servings/day`}
                        />

                        <ResultData
                            label="Vegetables"
                            value={`${assessment?.vegetable_servings_per_day} servings/day`}
                        />

                    </div>

                </section>


                {/* ACTIONS */}

                <div className="result-actions">

                    <button
                        className="cancel-button"
                        onClick={() =>
                            navigate(
                                `/patients/${patientId}`
                            )
                        }
                    >
                        Back to Patient
                    </button>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                `/patients/${patientId}/assessment`
                            )
                        }
                    >
                        New Assessment
                    </button>

                </div>

            </main>

        </div>
    );
}


function ResultData({ label, value }) {
    return (
        <div className="result-data-item">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


function formatFeatureName(feature) {

    const names = {

        age_years:
            "Age",

        sex_male:
            "Sex",

        bmi_kg_m2:
            "BMI",

        waist_cm:
            "Waist circumference",

        mean_systolic_bp_mmhg:
            "Mean systolic blood pressure",

        mean_diastolic_bp_mmhg:
            "Mean diastolic blood pressure",

        current_smoking:
            "Current smoking",

        alcohol_past_12_months:
            "Alcohol consumption",

        fruit_servings_per_day:
            "Fruit servings per day",

        vegetable_servings_per_day:
            "Vegetable servings per day",

        vigorous_work_activity:
            "Vigorous work activity",

        moderate_work_activity:
            "Moderate work activity",

        active_transport:
            "Active transportation",

        vigorous_leisure_activity:
            "Vigorous leisure activity",

        moderate_leisure_activity:
            "Moderate leisure activity",
    };

    return (
        names[feature] ||
        feature
    );
}


function formatFeatureValue(explanation) {

    const value =
        explanation.feature_value;

    if (
        explanation.feature ===
            "bmi_kg_m2" ||
        explanation.feature ===
            "waist_cm" ||
        explanation.feature ===
            "mean_systolic_bp_mmhg" ||
        explanation.feature ===
            "mean_diastolic_bp_mmhg"
    ) {
        return Number(value).toFixed(2);
    }

    return value;
}


export default AssessmentResult;