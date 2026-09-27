import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import PatientProfile from "./pages/PatientProfile";
import Assessment from "./pages/Assessment";
import AssessmentResult from "./pages/AssessmentResult";


function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/patients"
                    element={<Patients />}
                />

                <Route
                    path="/patients/new"
                    element={<NewPatient />}
                />
                <Route
                    path="/patients/:patientId"
                    element={<PatientProfile />}
                />
                <Route
                    path="/patients/:patientId/assessment"
                    element={<Assessment />}
                />
                <Route
                   path="/patients/:patientId/assessment/:assessmentId"
                   element={<AssessmentResult />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;