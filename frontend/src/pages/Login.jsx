import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await loginUser(username, password);

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            navigate("/dashboard");

        } catch (error) {

            if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else {
                setError(
                    "Unable to connect to the Diabetes CDSS server."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* HEADER */}

                <div className="login-header">

                    <div className="logo-circle">
                        CDSS
                    </div>

                    <h1>
                        Diabetes CDSS
                    </h1>

                    <p>
                        Clinical Decision Support System
                    </p>

                    <span>
                        Ghana Diabetes Risk Assessment
                    </span>

                </div>


                {/* LOGIN FORM */}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>
                            Username or Email
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="Enter username or email"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter password"
                            required
                        />

                    </div>


                    {/* ERROR MESSAGE */}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}


                    {/* SIGN IN */}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>


                    {/* REGISTRATION LINK */}

                    <div className="register-link">

                        <p>
                            New healthcare user?
                        </p>

                        <button
                            type="button"
                            className="link-button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Register here
                        </button>

                    </div>

                </form>


                {/* FOOTER */}

                <div className="login-footer">

                    <p>
                        AI-assisted clinical decision support
                    </p>

                    <small>
                        For authorized healthcare personnel
                    </small>

                </div>

            </div>

        </div>
    );
}

export default Login;