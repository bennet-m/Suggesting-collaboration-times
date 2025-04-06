import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Here we would typically do authentication
        // But since we're just using email for identification and not saving passwords:
        try {
            // Simulate API call
            setTimeout(() => {
                // Store email in localStorage for persistence
                localStorage.setItem('userEmail', email);
                
                // Set user as authenticated
                setAuthenticated(true);
                
                // Redirect to Google Calendar auth
                handleGoogleCalendarConnect();
            }, 500);
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        }
    };

    const handleGoogleCalendarConnect = () => {
        // In a real app, this would redirect to Google OAuth
        // For now, we'll just navigate to the dashboard
        console.log('Connecting to Google Calendar with email:', email);
        // After successful Google auth, we would redirect back and get user info
        navigate('/');
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                        <small className="password-hint">
                            Note: Password is only for authentication display purposes
                        </small>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="submit-btn">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                    <div className="google-connect-container">
                        <button 
                            type="button"
                            className="google-btn"
                            onClick={handleGoogleCalendarConnect}
                        >
                            <i className="fab fa-google"></i> Connect with Google Calendar
                        </button>
                    </div>
                </form>
                <div className="auth-toggle">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span onClick={toggleAuthMode}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login; 