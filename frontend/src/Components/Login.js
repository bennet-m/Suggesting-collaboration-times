import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setAuthenticated }) => {
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        // Redirect to backend's Google OAuth endpoint using HTTP
        window.location.href = 'http://127.0.0.1:5000/login';
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome to StudySync</h2>
                <p className="login-description">
                    Connect with your Google account to get started
                </p>
                <div className="google-connect-container">
                    <button 
                        type="button"
                        className="google-btn"
                        onClick={handleGoogleLogin}
                    >
                        <i className="fab fa-google"></i> Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login; 