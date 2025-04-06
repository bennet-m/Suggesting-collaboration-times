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
                                <h4>{userData.name}</h4>
                                <p>{userData.email}</p>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <ul>
                                <li><i className="fas fa-cog"></i> Settings</li>
                                <li><i className="fas fa-user-edit"></i> Edit Profile</li>
                                <li onClick={handleLogout} className="logout-item">
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p>Loading profile data...</p>
                )}
            </div>
        ),
        groups: (
            <div className="section-panel">
                <h3>Groups</h3>
                <div className="groups-list">
                    <div className="add-group">
                        <button className="add-button">
                            <i className="fas fa-plus"></i> Create New Group
                        </button>
                    </div>
                    <h4>Study Groups</h4>
                    {studyGroups.length > 0 ? (
                        <ul>
                            {studyGroups.map((group, index) => (
                                <li key={index}>
                                    <i className="fas fa-users"></i>
                                    <span>{group.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Loading study groups...</p>
                    )}
                </div>
            </div>
        ),
        friends: (
            <div className="section-panel">
                <h3>Friends</h3>
                <div className="friends-search">
                    <input type="text" placeholder="Search friends..." />
                </div>
                <div className="friends-list">
                    {users.length > 0 ? (
                        <ul>
                            {users.filter(user => user.name !== (userData?.name || '')).map((user, index) => (
                                <li key={index}>
                                    <i className="fas fa-user"></i>
                                    <span>{user.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Loading friends...</p>
                    )}
                </div>
                <div className="friend-actions">
                    <button className="action-button">
                        <i className="fas fa-user-plus"></i> Add Friend
                    </button>
                </div>
            </div>
        ),
        classes: (
            <div className="section-panel">
                <h3>Classes</h3>
                <div className="classes-content">
                    <h4>Upcoming Assignments</h4>
                    {assignments.length > 0 ? (
                        <ul className="assignments-list">
                            {assignments.sort((a, b) => new Date(a.due) - new Date(b.due)).map((assignment, index) => (
                                <li key={index} className="assignment-item">
                                    <div className="assignment-title">
                                        <i className="fas fa-file-alt"></i>
                                        <span>{assignment.title}</span>
                                    </div>
                                    <div className="assignment-due">
                                        <i className="fas fa-clock"></i>
                                        <span>{formatDate(assignment.due)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Loading assignments...</p>
                    )}
                    
                    <h4>Free Time Slots</h4>
                    {userData?.free_time ? (
                        <ul className="time-slots-list">
                            {userData.free_time.map((slot, index) => (
                                <li key={index} className="time-slot-item">
                                    <i className="fas fa-calendar-alt"></i>
                                    <span>{formatDate(slot.start)} - {new Date(slot.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Loading time slots...</p>
                    )}
                </div>
            </div>
        )
    };

    // Position sidebar below navbar or at top of page
    const sidebarStyle = {
        width: isCollapsed ? '0px' : '250px', 
        transition: 'all 0.3s ease', 
        position: 'fixed', 
        top: navbarVisible ? `${navbarHeight}px` : '0', 
        left: '0', 
        height: navbarVisible ? `calc(100% - ${navbarHeight}px)` : '100%', 
        zIndex: '100'
    };

    return (
        <div className="sidebar-container" style={sidebarStyle}>
            <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} >
                <div className="sidebar-header" style={{ height: '30px' }}>
                    <h3></h3>
                </div>
                <div className="icon-menu">
                    <div 
                        className={`menu-icon ${activeSection === 'profile' ? 'active' : ''}`} 
                        onClick={() => setSection('profile')}
                    >
                        <i className="fas fa-user"></i>
                    </div>
                    <div 
                        className={`menu-icon ${activeSection === 'groups' ? 'active' : ''}`} 
                        onClick={() => setSection('groups')}
                    >
                        <i className="fas fa-users"></i>
                    </div>
                    <div 
                        className={`menu-icon ${activeSection === 'friends' ? 'active' : ''}`} 
                        onClick={() => setSection('friends')}
                    >
                        <i className="fas fa-user-friends"></i>
                    </div>
                    <div 
                        className={`menu-icon ${activeSection === 'classes' ? 'active' : ''}`} 
                        onClick={() => setSection('classes')}
                    >
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                </div>
                <div className="section-content">
                    {sectionContent[activeSection]}
                </div>
            </div>
            <div className="toggle-icons" style={{ top: navbarVisible ? '20px' : '20px' }}>
                {isCollapsed ? (
                    <i className="fas fa-bars" onClick={onToggle}></i>
                ) : (
                    <i className="fas fa-times" onClick={onToggle}></i>
                )}
            </div>
        </div>
    );
}