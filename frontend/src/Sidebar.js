import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import userService from '../services/userService';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ isCollapsed = false, onToggle = () => {} }) {
    const [activeSection, setActiveSection] = useState('profile');
    const [userData, setUserData] = useState(null);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [studyGroups, setStudyGroups] = useState([]);
    const [navbarHeight, setNavbarHeight] = useState(56); // Default navbar height
    const [navbarVisible, setNavbarVisible] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Logout function
    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('userEmail');
        // Redirect to login page
        navigate('/login');
        // Page will reload and App.js will detect user is not authenticated
    };
    
    // Check if navbar is visible and get its height
    useEffect(() => {
        const checkNavbar = () => {
            const navbar = document.querySelector('nav');
            if (navbar) {
                // Check if navbar is actually visible (not hidden by CSS)
                const navbarRect = navbar.getBoundingClientRect();
                // Check if navbar has the 'hidden' class or is scrolled out of view
                const isHidden = navbar.classList.contains('hidden') || navbarRect.bottom <= 0;
                
                setNavbarVisible(!isHidden);
                if (!isHidden) {
                    setNavbarHeight(navbar.offsetHeight);
                }
            } else {
                setNavbarVisible(false);
            }
        };
        
        // Check immediately when component mounts
        checkNavbar();
        
        // Check when window is resized or scrolled
        window.addEventListener('resize', checkNavbar);
        window.addEventListener('scroll', checkNavbar);
        
        // Re-check when location changes
        const intervalId = setInterval(checkNavbar, 100);
        
        return () => {
            window.removeEventListener('resize', checkNavbar);
            window.removeEventListener('scroll', checkNavbar);
            clearInterval(intervalId);
        };
    }, [location]);
    
    // Load mock data from the database
    useEffect(() => {
        // Load user data
        const loadData = async () => {
            try {
                // Get the current user (using first user as default)
                const currentUser = await userService.getUserById(0);
                setUserData(currentUser);
                
                // Get all users for the friends list
                const allUsers = await userService.getAllUsers();
                setUsers(allUsers);
                
                // Get all assignments
                const allAssignments = await userService.getAllAssignments();
                setAssignments(allAssignments);
                
                // Get study groups
                const groups = await userService.getStudyGroups();
                setStudyGroups(groups);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        
        loadData();
    }, []);

    const setSection = (section) => {
        setActiveSection(section);
    };
    
    // Format date strings to be more readable
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Content for each section
    const sectionContent = {
        profile: (
            <div className="section-panel">
                <h3>Profile</h3>
                {userData ? (
                    <div className="user-profile">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <i className="fas fa-user-circle"></i>
                            </div>
                            <div className="profile-info">
                                <h4>{"Bennet"}</h4>
                                <p>{"bmatazzoni@g.hmc.edu"}</p>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <ul>
                                <li><i className="fas fa-cog"></i> Settings</li>
                                <li><i className="fas fa-user-edit"></i> Edit Profile</li>
                                <li onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p>Loading profile data...</p>
                )}
            </div>
        ),
    };

    return (
        <div className="sidebar">
            {/* Rest of the component content */}
        </div>
    );
} 