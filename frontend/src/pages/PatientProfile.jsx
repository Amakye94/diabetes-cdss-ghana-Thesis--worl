import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function PatientProfile() {
    const navigate = useNavigate();
    const { patientId } = useParams();

    const [patient, setPatient] = useState(null);
    const [assessments, setAssessments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [assessmentLoading, setAssessmentLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadPatient();
        loadAssessments();
    }, [patientId]);

    const getAuthHeaders = () => {
        return {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(
                    "access_token"
                )}`,
            },
        };
    };

    const loadPatient = async () => {
        try {
            const response = await api.get(
                `/patients/${patientId}`,
                getAuthHeaders()
            );

            setPatient(response.data);

        } catch (error) {
            console.error("Patient profile error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.detail ||
                "Unable to load patient."
            );

        } finally {
            setLoading(false);
        }
    };

    const loadAssessments = async () => {
        try {
            setAssessmentLoading(true);

            const response = await api.get(
                `/assessments/patient/${patientId}`,
                getAuthHeaders()
            );

            setAssessments(response.data.assessments || []);

        } catch (error) {
            console.error("Assessment history error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login");
                return;
            }

            setAssessments([]);

        } finally {
            setAssessmentLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "Date not available";
        }

        return new Date(dateString).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatScore = (score) => {
        if (score === null || score === undefined) {
            return "—";
        }

        return `${(score * 100).toFixed(1)}%`;
    };

    const getClassificationText = (prediction) => {
        if (!prediction) {
            return "No prediction";
        }

        if (prediction.classification === 1) {
            return "At or above threshold";
        }

        return "Below threshold";
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading patient profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-loading">
                <p>{error}</p>

                <button
                    className="primary-button"
                    onClick={() => navigate("/patients")}
                >
                    Back to Patients
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        D
                    </div>

                    <div>
                        <h2>Diabetes CDSS</h2>
                        <span>Ghana</span>
                    </div>

                </div>

                <nav className="sidebar-nav">

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span className="nav-icon">⌂</span>
                        Dashboard
                    </button>

                    <button
                        className="nav-item active"
                        onClick={() =>
                            navigate("/patients")
                        }
                    >
                        <span className="nav-icon">♙</span>
                        Patients
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/patients/new")
                        }
                    >
                        <span className="nav-icon">＋</span>
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
                            Patient Management
                        </p>

                        <h1>Patient Profile</h1>

                        <p className="header-subtitle">
                            Patient information and
                            clinical assessment history.
                        </p>

                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                `/patients/${patient.id}/assessment`
                            )
                        }
                    >
                        + New Assessment
                    </button>

                </header>


                {/* PATIENT HEADER */}

                <section className="patient-profile-header">

                    <div className="profile-avatar">

                        {patient.first_name
                            ?.charAt(0)
                            .toUpperCase()}

                    </div>

                    <div>

                        <h2>
                            {patient.first_name}{" "}
                            {patient.last_name}
                        </h2>

                        <p>
                            Patient Number:{" "}
                            <strong>
                                {patient.patient_number}
                            </strong>
                        </p>

                    </div>

                </section>


                {/* PATIENT INFORMATION */}

                <section className="dashboard-section">

                    <div className="section-title">

                        <h2>
                            Patient Information
                        </h2>

                        <p>
                            Demographic and contact
                            information
                        </p>

                    </div>


                    <div className="profile-card">

                        <div className="profile-field">

                            <span>
                                First Name
                            </span>

                            <strong>
                                {patient.first_name}
                            </strong>

                        </div>


                        <div className="profile-field">

                            <span>
                                Last Name
                            </span>

                            <strong>
                                {patient.last_name}
                            </strong>

                        </div>


                        <div className="profile-field">

                            <span>
                                Sex
                            </span>

                            <strong>
                                {patient.sex}
                            </strong>

                        </div>


                        <div className="profile-field">

                            <span>
                                Date of Birth
                            </span>

                            <strong>
                                {patient.date_of_birth ||
                                    "Not provided"}
                            </strong>

                        </div>


                        <div className="profile-field">

                            <span>
                                Telephone
                            </span>

                            <strong>
                                {patient.telephone ||
                                    "Not provided"}
                            </strong>

                        </div>


                        <div className="profile-field">

                            <span>
                                Emergency Contact
                            </span>

                            <strong>
                                {patient.emergency_contact ||
                                    "Not provided"}
                            </strong>

                        </div>


                        <div className="profile-field full">

                            <span>
                                Address
                            </span>

                            <strong>
                                {patient.address ||
                                    "Not provided"}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* CLINICAL ASSESSMENTS */}

                <section className="dashboard-section">

                    <div className="section-title-row">

                        <div>

                            <h2>
                                Clinical Assessments
                            </h2>

                            <p>
                                AI-assisted diabetes
                                risk assessment history
                            </p>

                        </div>

                        <button
                            className="view-all-button"
                            onClick={() =>
                                navigate(
                                    `/patients/${patient.id}/assessment`
                                )
                            }
                        >
                            + New Assessment
                        </button>

                    </div>


                    {/* LOADING */}

                    {assessmentLoading ? (

                        <div className="empty-state">

                            <div className="loading-spinner"></div>

                            <p>
                                Loading assessment history...
                            </p>

                        </div>

                    ) : assessments.length === 0 ? (

                        /* NO ASSESSMENTS */

                        <div className="empty-state">

                            <div className="empty-icon">
                                +
                            </div>

                            <h3>
                                No Clinical Assessments
                            </h3>

                            <p>
                                No AI-assisted diabetes
                                risk assessment has been
                                completed for this patient.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate(
                                        `/patients/${patient.id}/assessment`
                                    )
                                }
                            >
                                Start Assessment
                            </button>

                        </div>

                    ) : (

                        /* ASSESSMENT HISTORY */

                        <div className="assessment-history">

                            <div className="assessment-history-header">

                                <span>
                                    Assessment
                                </span>

                                <span>
                                    Date
                                </span>

                                <span>
                                    Prediction
                                </span>

                                <span>
                                    Classification
                                </span>

                                <span>
                                    Action
                                </span>

                            </div>


                            {assessments.map(
                                (assessment) => (

                                    <div
                                        className="assessment-history-row"
                                        key={
                                            assessment.assessment_id
                                        }
                                    >

                                        <span className="assessment-number">

                                            #
                                            {
                                                assessment.assessment_id
                                            }

                                        </span>


                                        <span>

                                            {
                                                formatDate(
                                                    assessment.assessment_date
                                                )
                                            }

                                        </span>


                                        <span className="assessment-score">

                                            {
                                                formatScore(
                                                    assessment.prediction
                                                        ?.prediction_score
                                                )
                                            }

                                        </span>


                                        <span>

                                            <span
                                                className={
                                                    assessment.prediction
                                                        ?.classification === 1
                                                        ? "assessment-status high"
                                                        : "assessment-status low"
                                                }
                                            >

                                                {
                                                    getClassificationText(
                                                        assessment.prediction
                                                    )
                                                }

                                            </span>

                                        </span>


                                        <button
                                            className="open-button"
                                            onClick={() =>
                                                navigate(
                                                    `/patients/${patient.id}/assessment/${assessment.assessment_id}`
                                                )
                                            }
                                        >
                                            View
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* FOOTER ACTIONS */}

                <div className="profile-actions">

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/patients")
                        }
                    >
                        Back to Patients
                    </button>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                `/patients/${patient.id}/assessment`
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

export default PatientProfile;