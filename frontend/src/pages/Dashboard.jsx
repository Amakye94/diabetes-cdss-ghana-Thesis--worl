import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getCurrentUser } from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const currentUser = await getCurrentUser();

            const response = await api.get("/patients/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "access_token"
                    )}`,
                },
            });

            setUser(currentUser);
            setPatients(response.data);
        } catch (error) {
            console.error("Dashboard error:", error);

            localStorage.removeItem("access_token");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading Diabetes CDSS...</p>
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
                        className="nav-item active"
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
                        className="nav-item"
                        onClick={() => navigate("/patients/new")}
                    >
                        <span className="nav-icon">＋</span>
                        New Patient
                    </button>

                </nav>

                <div className="sidebar-bottom">

                    <div className="logged-user">
                        <div className="user-avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user?.username}</strong>
                            <span>{user?.role}</span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={logout}
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
                            Clinical Workspace
                        </p>

                        <h1>
                            Good day, {user?.username}
                        </h1>

                        <p className="header-subtitle">
                            Welcome to the Diabetes Clinical Decision
                            Support System.
                        </p>
                    </div>

                    <div className="header-user">

                        <div className="header-avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user?.username}</strong>
                            <span>{user?.role}</span>
                        </div>

                    </div>

                </header>


                {/* STAT CARDS */}
                <section className="dashboard-stats">

                    <div className="stat-card">
                        <div className="stat-icon patients-icon">
                            ♙
                        </div>

                        <div>
                            <span>Total Patients</span>
                            <strong>{patients.length}</strong>
                        </div>
                    </div>


                    <div className="stat-card">
                        <div className="stat-icon assessment-icon">
                            +
                        </div>

                        <div>
                            <span>Clinical Assessments</span>
                            <strong>—</strong>
                        </div>
                    </div>


                    <div className="stat-card">
                        <div className="stat-icon ai-icon">
                            AI
                        </div>

                        <div>
                            <span>AI Model</span>
                            <strong className="active-status">
                                Active
                            </strong>
                        </div>
                    </div>

                </section>


                {/* QUICK ACTIONS */}
                <section className="dashboard-section">

                    <div className="section-title">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>
                                Start a clinical workflow
                            </p>
                        </div>
                    </div>


                    <div className="quick-actions">

                        <button
                            className="action-card"
                            onClick={() => navigate("/patients/new")}
                        >
                            <div className="action-icon">
                                +
                            </div>

                            <div>
                                <strong>
                                    Register Patient
                                </strong>

                                <span>
                                    Create a new patient record
                                </span>
                            </div>

                            <span className="arrow">
                                →
                            </span>
                        </button>


                        <button
                            className="action-card"
                            onClick={() => navigate("/patients")}
                        >
                            <div className="action-icon">
                                ♙
                            </div>

                            <div>
                                <strong>
                                    Patient Records
                                </strong>

                                <span>
                                    Search and manage patients
                                </span>
                            </div>

                            <span className="arrow">
                                →
                            </span>
                        </button>

                    </div>

                </section>


                {/* PATIENTS */}
                <section className="dashboard-section">

                    <div className="section-title section-title-row">

                        <div>
                            <h2>Recent Patients</h2>
                            <p>
                                Recently registered patients
                            </p>
                        </div>

                        <button
                            className="view-all-button"
                            onClick={() => navigate("/patients")}
                        >
                            View all →
                        </button>

                    </div>


                    {patients.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ♙
                            </div>

                            <h3>
                                No patients registered
                            </h3>

                            <p>
                                Register a patient to begin
                                a clinical assessment.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate("/patients/new")
                                }
                            >
                                Register Patient
                            </button>

                        </div>

                    ) : (

                        <div className="patient-table">

                            <div className="table-header">
                                <span>Patient Number</span>
                                <span>Name</span>
                                <span>Sex</span>
                                <span>Action</span>
                            </div>


                            {patients
                                .slice(0, 5)
                                .map((patient) => (

                                    <div
                                        className="table-row"
                                        key={patient.id}
                                    >

                                        <span className="patient-number">
                                            {patient.patient_number}
                                        </span>

                                        <span>
                                            {patient.first_name}{" "}
                                            {patient.last_name}
                                        </span>

                                        <span>
                                            {patient.sex}
                                        </span>

                                        <button
                                            className="open-button"
                                            onClick={() =>
                                                navigate(
                                                    `/patients/${patient.id}`
                                                )
                                            }
                                        >
                                            Open
                                        </button>

                                    </div>

                                ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;