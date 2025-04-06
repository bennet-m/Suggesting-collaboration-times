import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = ({ setAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Check for auth parameters on component mount
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const authSuccess = queryParams.get('auth');
        
        if (authSuccess === 'success') {
            const userName = queryParams.get('name');
            const userEmail = queryParams.get('email');
            const hasAssignments = queryParams.get('has_assignments') === 'true';
            const hasFreeTime = queryParams.get('has_free_time') === 'true';
            
            if (userName && userEmail) {
                // Store user info in localStorage
                localStorage.setItem('userEmail', userEmail);
                localStorage.setItem('userName', userName);
                
                // Set as authenticated
                setAuthenticated(true);
                
                // Show a success message based on what was found
                let message = '';
                if (hasAssignments && hasFreeTime) {
                    message = 'Found assignments and free time in your calendar!';
                } else if (hasAssignments) {
                    message = 'Found assignments in your calendar, but no free time blocks.';
                } else if (hasFreeTime) {
                    message = 'Found free time in your calendar, but no assignments.';
                } else {
                    message = 'Connected to Google Calendar successfully!';
                }
                
                alert(message);
                
                // Navigate to dashboard
                navigate('/', { replace: true });
            }
        }
    }, [location, navigate, setAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate fields
        if (!email) {
            setError('Email is required');
            return;
        }

        if (!name) {
            setError('Full name is required');
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
                // Store user info in localStorage for persistence
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', name);
                
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

    const handleGoogleCalendarConnect = async () => {
        // First try to logout any existing sessions
        const BACKEND_URL = 'http://127.0.0.1:5000';
        try {
            // Clear any existing session
            await fetch(`${BACKEND_URL}/logout`, {
                method: 'GET',
                credentials: 'include',
            });
            console.log('Cleared any existing session');
        } catch (error) {
            console.error('Error clearing session:', error);
            // Continue anyway
        }
        
        // Redirect to backend login endpoint for Google OAuth flow
        window.location.href = `${BACKEND_URL}/login`;
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
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>
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