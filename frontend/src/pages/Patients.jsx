import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Patients() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const response = await api.get("/patients/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "access_token"
                    )}`,
                },
            });

            setPatients(response.data);
        } catch (error) {
            console.error(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter((patient) => {
        const text = `
            ${patient.patient_number}
            ${patient.first_name}
            ${patient.last_name}
        `.toLowerCase();

        return text.includes(search.toLowerCase());
    });

    return (
        <div className="dashboard">

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


            <main className="dashboard-main">

                <header className="dashboard-header">

                    <div>
                        <p className="page-label">
                            Patient Management
                        </p>

                        <h1>Patients</h1>

                        <p className="header-subtitle">
                            View and manage registered patient records.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/patients/new")
                        }
                    >
                        + Register Patient
                    </button>

                </header>


                <section className="dashboard-section">

                    <div className="patient-toolbar">

                        <input
                            type="text"
                            placeholder="Search patient number or name..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        <span>
                            {filteredPatients.length} patient(s)
                        </span>

                    </div>


                    {loading ? (

                        <div className="empty-state">
                            Loading patients...
                        </div>

                    ) : filteredPatients.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ♙
                            </div>

                            <h3>
                                No patients found
                            </h3>

                            <p>
                                Register a patient to create
                                a clinical record.
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

                            {filteredPatients.map(
                                (patient) => (

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
                                                navigate(`/patients/${patient.id}`)    
                                            }
                                        >
                                            Open
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default Patients;