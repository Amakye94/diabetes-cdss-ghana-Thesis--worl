import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function NewPatient() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        patient_number: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        sex: "",
        telephone: "",
        address: "",
        emergency_contact: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("access_token");

            await api.post(
                "/patients/",
                {
                    ...formData,
                    date_of_birth:
                        formData.date_of_birth || null,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            navigate("/patients");

        } catch (error) {
            console.error("Patient registration error:", error);

            if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else {
                setError(
                    "Unable to register patient. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

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
                        onClick={() => navigate("/dashboard")}
                    >
                        <span className="nav-icon">⌂</span>
                        Dashboard
                    </button>


                    <button
                        className="nav-item"
                        onClick={() => navigate("/patients")}
                    >
                        <span className="nav-icon">♙</span>
                        Patients
                    </button>


                    <button
                        className="nav-item active"
                        onClick={() => navigate("/patients/new")}
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

                        <h1>
                            Register New Patient
                        </h1>

                        <p className="header-subtitle">
                            Create a new patient record.
                        </p>

                    </div>

                </header>


                <section className="patient-form-card">

                    <div className="form-card-header">

                        <div className="form-card-icon">
                            +
                        </div>

                        <div>

                            <h2>
                                Patient Information
                            </h2>

                            <p>
                                Enter the patient's demographic
                                and contact information.
                            </p>

                        </div>

                    </div>


                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* PATIENT IDENTIFICATION */}

                        <div className="form-section">

                            <h3>
                                Patient Identification
                            </h3>

                            <div className="form-grid">

                                <div className="clinical-form-group">

                                    <label>
                                        Patient Number *
                                    </label>

                                    <input
                                        type="text"
                                        name="patient_number"
                                        value={
                                            formData.patient_number
                                        }
                                        onChange={handleChange}
                                        placeholder="e.g. PAT-0002"
                                        required
                                    />

                                </div>


                                <div className="clinical-form-group">

                                    <label>
                                        Sex *
                                    </label>

                                    <select
                                        name="sex"
                                        value={formData.sex}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select sex
                                        </option>

                                        <option value="Male">
                                            Male
                                        </option>

                                        <option value="Female">
                                            Female
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* PERSONAL INFORMATION */}

                        <div className="form-section">

                            <h3>
                                Personal Information
                            </h3>

                            <div className="form-grid">

                                <div className="clinical-form-group">

                                    <label>
                                        First Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="first_name"
                                        value={
                                            formData.first_name
                                        }
                                        onChange={handleChange}
                                        placeholder="First name"
                                        required
                                    />

                                </div>


                                <div className="clinical-form-group">

                                    <label>
                                        Last Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="last_name"
                                        value={
                                            formData.last_name
                                        }
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        required
                                    />

                                </div>


                                <div className="clinical-form-group">

                                    <label>
                                        Date of Birth
                                    </label>

                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={
                                            formData.date_of_birth
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>


                        {/* CONTACT INFORMATION */}

                        <div className="form-section">

                            <h3>
                                Contact Information
                            </h3>

                            <div className="form-grid">

                                <div className="clinical-form-group">

                                    <label>
                                        Telephone
                                    </label>

                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={
                                            formData.telephone
                                        }
                                        onChange={handleChange}
                                        placeholder="+233 ..."
                                    />

                                </div>


                                <div className="clinical-form-group">

                                    <label>
                                        Emergency Contact
                                    </label>

                                    <input
                                        type="text"
                                        name="emergency_contact"
                                        value={
                                            formData.emergency_contact
                                        }
                                        onChange={handleChange}
                                        placeholder="Name and telephone"
                                    />

                                </div>


                                <div className="clinical-form-group full-width">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            formData.address
                                        }
                                        onChange={handleChange}
                                        placeholder="Patient address"
                                        rows="3"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* BUTTONS */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    navigate("/patients")
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Registering..."
                                    : "Register Patient"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
}

export default NewPatient;