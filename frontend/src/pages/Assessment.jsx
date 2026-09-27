import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function Assessment() {
    const navigate = useNavigate();
    const { patientId } = useParams();

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        height_cm: "",
        weight_kg: "",
        waist_cm: "",

        systolic_1: "",
        systolic_2: "",
        systolic_3: "",

        diastolic_1: "",
        diastolic_2: "",
        diastolic_3: "",

        current_smoking: "",
        alcohol_past_12_months: "",

        fruit_servings_per_day: "",
        vegetable_servings_per_day: "",

        vigorous_work_activity: "",
        moderate_work_activity: "",
        active_transport: "",
        vigorous_leisure_activity: "",
        moderate_leisure_activity: "",
    });

    useEffect(() => {
        loadPatient();
    }, [patientId]);

    const loadPatient = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await api.get(
                `/patients/${patientId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPatient(response.data);

        } catch (error) {
            console.error(error);

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

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) {
            return "";
        }

        const today = new Date();
        const birthDate = new Date(dateOfBirth);

        let age =
            today.getFullYear() -
            birthDate.getFullYear();

        const monthDifference =
            today.getMonth() -
            birthDate.getMonth();

        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() < birthDate.getDate()
            )
        ) {
            age--;
        }

        return age;
    };

    const calculateBMI = () => {
        const height = Number(formData.height_cm);
        const weight = Number(formData.weight_kg);

        if (!height || !weight || height <= 0) {
            return "";
        }

        const heightMeters = height / 100;

        return (
            weight /
            (heightMeters * heightMeters)
        ).toFixed(2);
    };

    const calculateMean = (value1, value2, value3) => {
        const values = [
            Number(value1),
            Number(value2),
            Number(value3),
        ];

        if (values.some((value) => !value)) {
            return "";
        }

        return (
            values.reduce(
                (sum, value) => sum + value,
                0
            ) / values.length
        ).toFixed(2);
    };

    const bmi = calculateBMI();

    const meanSystolic = calculateMean(
        formData.systolic_1,
        formData.systolic_2,
        formData.systolic_3
    );

    const meanDiastolic = calculateMean(
        formData.diastolic_1,
        formData.diastolic_2,
        formData.diastolic_3
    );

    const age = calculateAge(
        patient?.date_of_birth
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!age) {
            setError(
                "The patient's date of birth is required."
            );
            return;
        }

        if (!bmi) {
            setError(
                "Please enter valid height and weight."
            );
            return;
        }

        if (!meanSystolic || !meanDiastolic) {
            setError(
                "Please enter all three blood pressure readings."
            );
            return;
        }

        setSaving(true);

        try {
            const token =
                localStorage.getItem("access_token");

            const sexMale =
                patient.sex.toLowerCase() === "male"
                    ? 1
                    : 0;

            const assessmentData = {
                patient_id: Number(patientId),

                age_years: Number(age),

                height_cm:
                    Number(formData.height_cm),

                weight_kg:
                    Number(formData.weight_kg),

                waist_cm:
                    Number(formData.waist_cm),

                mean_systolic_bp_mmhg:
                    Number(meanSystolic),

                mean_diastolic_bp_mmhg:
                    Number(meanDiastolic),

                current_smoking:
                    Number(formData.current_smoking),

                alcohol_past_12_months:
                    Number(
                        formData.alcohol_past_12_months
                    ),

                fruit_servings_per_day:
                    Number(
                        formData.fruit_servings_per_day
                    ),

                vegetable_servings_per_day:
                    Number(
                        formData.vegetable_servings_per_day
                    ),

                vigorous_work_activity:
                    Number(
                        formData.vigorous_work_activity
                    ),

                moderate_work_activity:
                    Number(
                        formData.moderate_work_activity
                    ),

                active_transport:
                    Number(
                        formData.active_transport
                    ),

                vigorous_leisure_activity:
                    Number(
                        formData.vigorous_leisure_activity
                    ),

                moderate_leisure_activity:
                    Number(
                        formData.moderate_leisure_activity
                    ),
            };

            console.log(
                "Assessment data:",
                assessmentData
            );

            const response = await api.post(
                "/assessments/",
                assessmentData,
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

            navigate(
                `/patients/${patientId}/assessment/${response.data.assessment?.id || response.data.id}`
            );

        } catch (error) {
            console.error(
                "Assessment error:",
                error
            );

            if (error.response?.data?.detail) {
                setError(
                    error.response.data.detail
                );
            } else {
                setError(
                    "Unable to complete the AI assessment."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>
                    Loading patient information...
                </p>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="dashboard-loading">
                <p>
                    Patient could not be found.
                </p>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate("/patients")
                    }
                >
                    Back to Patients
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard">

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


            <main className="dashboard-main">

                <header className="dashboard-header">

                    <div>

                        <p className="page-label">
                            Clinical Assessment
                        </p>

                        <h1>
                            New Diabetes Assessment
                        </h1>

                        <p className="header-subtitle">
                            Enter the patient's clinical,
                            lifestyle and physical activity
                            information.
                        </p>

                    </div>

                </header>


                {/* PATIENT SUMMARY */}

                <section className="assessment-patient-card">

                    <div className="assessment-avatar">
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
                            {patient.patient_number}
                            {" • "}
                            {patient.sex}
                            {" • "}
                            {age} years
                        </p>

                    </div>

                </section>


                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}


                <form
                    onSubmit={handleSubmit}
                    className="assessment-form"
                >

                    {/* PHYSICAL MEASUREMENTS */}

                    <section className="assessment-section">

                        <div className="assessment-section-header">

                            <div className="section-number">
                                1
                            </div>

                            <div>
                                <h2>
                                    Physical Measurements
                                </h2>

                                <p>
                                    Enter the patient's
                                    current physical
                                    measurements.
                                </p>
                            </div>

                        </div>


                        <div className="form-grid">

                            <div className="clinical-form-group">

                                <label>
                                    Height (cm) *
                                </label>

                                <input
                                    type="number"
                                    name="height_cm"
                                    value={
                                        formData.height_cm
                                    }
                                    onChange={handleChange}
                                    min="50"
                                    max="250"
                                    step="0.1"
                                    placeholder="e.g. 175"
                                    required
                                />

                            </div>


                            <div className="clinical-form-group">

                                <label>
                                    Weight (kg) *
                                </label>

                                <input
                                    type="number"
                                    name="weight_kg"
                                    value={
                                        formData.weight_kg
                                    }
                                    onChange={handleChange}
                                    min="20"
                                    max="300"
                                    step="0.1"
                                    placeholder="e.g. 80"
                                    required
                                />

                            </div>


                            <div className="clinical-form-group">

                                <label>
                                    BMI
                                </label>

                                <input
                                    type="text"
                                    value={
                                        bmi
                                            ? `${bmi} kg/m²`
                                            : "Calculated automatically"
                                    }
                                    readOnly
                                />

                            </div>


                            <div className="clinical-form-group">

                                <label>
                                    Waist Circumference (cm) *
                                </label>

                                <input
                                    type="number"
                                    name="waist_cm"
                                    value={
                                        formData.waist_cm
                                    }
                                    onChange={handleChange}
                                    min="30"
                                    max="250"
                                    step="0.1"
                                    placeholder="e.g. 94"
                                    required
                                />

                            </div>

                        </div>

                    </section>


                    {/* BLOOD PRESSURE */}

                    <section className="assessment-section">

                        <div className="assessment-section-header">

                            <div className="section-number">
                                2
                            </div>

                            <div>
                                <h2>
                                    Blood Pressure
                                </h2>

                                <p>
                                    Enter three blood
                                    pressure readings.
                                    The system calculates
                                    the mean automatically.
                                </p>
                            </div>

                        </div>


                        <div className="bp-table">

                            <div className="bp-header">
                                <span></span>
                                <span>
                                    Systolic (mmHg)
                                </span>
                                <span>
                                    Diastolic (mmHg)
                                </span>
                            </div>


                            <div className="bp-row">

                                <strong>
                                    Reading 1
                                </strong>

                                <input
                                    type="number"
                                    name="systolic_1"
                                    value={
                                        formData.systolic_1
                                    }
                                    onChange={handleChange}
                                    min="50"
                                    max="300"
                                    required
                                />

                                <input
                                    type="number"
                                    name="diastolic_1"
                                    value={
                                        formData.diastolic_1
                                    }
                                    onChange={handleChange}
                                    min="30"
                                    max="200"
                                    required
                                />

                            </div>


                            <div className="bp-row">

                                <strong>
                                    Reading 2
                                </strong>

                                <input
                                    type="number"
                                    name="systolic_2"
                                    value={
                                        formData.systolic_2
                                    }
                                    onChange={handleChange}
                                    min="50"
                                    max="300"
                                    required
                                />

                                <input
                                    type="number"
                                    name="diastolic_2"
                                    value={
                                        formData.diastolic_2
                                    }
                                    onChange={handleChange}
                                    min="30"
                                    max="200"
                                    required
                                />

                            </div>


                            <div className="bp-row">

                                <strong>
                                    Reading 3
                                </strong>

                                <input
                                    type="number"
                                    name="systolic_3"
                                    value={
                                        formData.systolic_3
                                    }
                                    onChange={handleChange}
                                    min="50"
                                    max="300"
                                    required
                                />

                                <input
                                    type="number"
                                    name="diastolic_3"
                                    value={
                                        formData.diastolic_3
                                    }
                                    onChange={handleChange}
                                    min="30"
                                    max="200"
                                    required
                                />

                            </div>


                            <div className="bp-mean">

                                <span>
                                    Mean
                                </span>

                                <strong>
                                    {meanSystolic
                                        ? `${meanSystolic} mmHg`
                                        : "—"}
                                </strong>

                                <strong>
                                    {meanDiastolic
                                        ? `${meanDiastolic} mmHg`
                                        : "—"}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* SMOKING AND ALCOHOL */}

                    <section className="assessment-section">

                        <div className="assessment-section-header">

                            <div className="section-number">
                                3
                            </div>

                            <div>
                                <h2>
                                    Tobacco and Alcohol
                                </h2>

                                <p>
                                    Lifestyle information
                                    used by the AI model.
                                </p>
                            </div>

                        </div>


                        <div className="form-grid">

                            <div className="clinical-form-group">

                                <label>
                                    Does the patient
                                    currently smoke?
                                </label>

                                <select
                                    name="current_smoking"
                                    value={
                                        formData.current_smoking
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="1">
                                        Yes
                                    </option>

                                    <option value="0">
                                        No
                                    </option>

                                </select>

                            </div>


                            <div className="clinical-form-group">

                                <label>
                                    Has the patient consumed
                                    alcohol during the past
                                    12 months?
                                </label>

                                <select
                                    name="alcohol_past_12_months"
                                    value={
                                        formData.alcohol_past_12_months
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="1">
                                        Yes
                                    </option>

                                    <option value="0">
                                        No
                                    </option>

                                </select>

                            </div>

                        </div>

                    </section>


                    {/* DIET */}

                    <section className="assessment-section">

                        <div className="assessment-section-header">

                            <div className="section-number">
                                4
                            </div>

                            <div>
                                <h2>
                                    Dietary Information
                                </h2>

                                <p>
                                    Average daily fruit
                                    and vegetable intake.
                                </p>
                            </div>

                        </div>


                        <div className="form-grid">

                            <div className="clinical-form-group">

                                <label>
                                    Fruit servings per day *
                                </label>

                                <input
                                    type="number"
                                    name="fruit_servings_per_day"
                                    value={
                                        formData.fruit_servings_per_day
                                    }
                                    onChange={handleChange}
                                    min="0"
                                    max="30"
                                    step="0.1"
                                    placeholder="e.g. 2"
                                    required
                                />

                            </div>


                            <div className="clinical-form-group">

                                <label>
                                    Vegetable servings per day *
                                </label>

                                <input
                                    type="number"
                                    name="vegetable_servings_per_day"
                                    value={
                                        formData.vegetable_servings_per_day
                                    }
                                    onChange={handleChange}
                                    min="0"
                                    max="30"
                                    step="0.1"
                                    placeholder="e.g. 3"
                                    required
                                />

                            </div>

                        </div>

                    </section>


                    {/* PHYSICAL ACTIVITY */}

                    <section className="assessment-section">

                        <div className="assessment-section-header">

                            <div className="section-number">
                                5
                            </div>

                            <div>
                                <h2>
                                    Physical Activity
                                </h2>

                                <p>
                                    Physical activity
                                    information used
                                    by the AI model.
                                </p>
                            </div>

                        </div>


                        <div className="activity-grid">

                            <div className="activity-question">

                                <div>
                                    <strong>
                                        Vigorous work activity
                                    </strong>

                                    <span>
                                        Does the patient
                                        perform vigorous
                                        physical activity
                                        at work?
                                    </span>
                                </div>

                                <select
                                    name="vigorous_work_activity"
                                    value={
                                        formData.vigorous_work_activity
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="1">
                                        Yes
                                    </option>

                                    <option value="0">
                                        No
                                    </option>

                                </select>

                            </div>


                            <div className="activity-question">

                                <div>
                                    <strong>
                                        Moderate work activity
                                    </strong>

                                    <span>
                                        Does the patient
                                        perform moderate
                                        physical activity
                                        at work?
                                    </span>
                                </div>

                                <select
                                    name="moderate_work_activity"
                                    value={
                                        formData.moderate_work_activity
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="1">
                                        Yes
                                    </option>

                                    <option value="0">
                                        No
                                    </option>

                                </select>

                            </div>


                            <div className="activity-question">

                                <div>
                                    <strong>
                                        Active transportation
                                    </strong>

                                    <span>
                                        Does the patient
                                        regularly walk or
                                        cycle for
                                        transportation?
                                    </span>
                                </div>

                                <select
                                    name="active_transport"
                                    value={
                                        formData.active_transport
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="1">
                                        Yes
                                    </option>

                                    <option value="0">
                                        No
                                    </option>

                                </select>

                            </div>


                            <div className="activity-question">

                                <div>
                                    <strong>
                                        Vigorous leisure activity
                                    </strong>

                                    <span>
                                        Does the patient
                                        perform vigorous
                                        physical activity
                                        during leisure time?
                                    </span>
                                </div>

                                <select
                                    name="vigorous_leisure_activity"
                                    value={
                                        formData.vigorous_leisure_activity
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="1">
                                        Yes
                                    </option>

                                    <option value="0">
                                        No
                                    </option>

                                </select>

                            </div>


                            <div className="activity-question">

                                <div>
                                    <strong>
                                        Moderate leisure activity
                                    </strong>

                                    <span>
                                        Does the patient
                                        perform moderate
                                        physical activity
                                        during leisure time?
                                    </span>
                                </div>

                                <select
                                    name="moderate_leisure_activity"
                                    value={
                                        formData.moderate_leisure_activity
                                    }
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="1">
                                        Yes
                                    </option>

                                    <option value="0">
                                        No
                                    </option>

                                </select>

                            </div>

                        </div>

                    </section>


                    {/* ACTIONS */}

                    <div className="assessment-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate(
                                    `/patients/${patientId}`
                                )
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Running AI Assessment..."
                                : "Review and Run AI Assessment"}
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
}

export default Assessment;