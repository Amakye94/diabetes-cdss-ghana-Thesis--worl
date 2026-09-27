import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("NURSE");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await registerUser({
                username,
                email,
                password,
                role,
            });

            setSuccess(
                "Account created successfully. You can now sign in."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else {
                setError("Unable to create the account.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">

                    <div className="logo-circle">
                        CDSS
                    </div>

                    <h1>Create Account</h1>

                    <p>
                        Diabetes Clinical Decision Support System
                    </p>

                    <span>
                        Authorized Healthcare Personnel
                    </span>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Create password"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>

                        <select
                            value={role}
                            onChange={(event) =>
                                setRole(event.target.value)
                            }
                        >
                            <option value="NURSE">
                                Nurse
                            </option>

                            <option value="DOCTOR">
                                Doctor
                            </option>
                        </select>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <div className="login-footer">

                    <p>
                        Already have an account?
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate("/login")}
                    >
                        Back to Sign In
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Register;