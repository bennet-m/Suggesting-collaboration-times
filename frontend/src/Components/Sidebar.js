import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import userService from '../services/userService';
import { useLocation, useNavigate } from 'react-router-dom';
import NotImplementedPopup from './NotImplementedPopup';

export default function Sidebar({ isCollapsed = false, onToggle = () => {} }) {
    const [activeSection, setActiveSection] = useState('profile');
    const [userData, setUserData] = useState(null);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [studyGroups, setStudyGroups] = useState([]);
    const [navbarHeight, setNavbarHeight] = useState(56); // Default navbar height
    const [navbarVisible, setNavbarVisible] = useState(true);
    const [showAddFriendPopup, setShowAddFriendPopup] = useState(false);
    const [friendEmail, setFriendEmail] = useState('');
    const [classmates, setClassmates] = useState([]);
    const [notImplementedPopup, setNotImplementedPopup] = useState({
        isOpen: false,
        featureName: ''
    });
    const location = useLocation();
    const navigate = useNavigate();
    
    // Show not implemented popup
    const showNotImplementedFeature = (featureName) => {
        setNotImplementedPopup({
            isOpen: true,
            featureName
        });
    };
    
    // Close not implemented popup
    const closeNotImplementedPopup = () => {
        setNotImplementedPopup({
            isOpen: false,
            featureName: ''
        });
    };
    
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
                
                // Mock classmates data
                const mockClassmates = allUsers
                    .filter(user => user.name !== (currentUser?.name || ''))
                    .slice(0, 3) // Just take first 3 users as classmates for demo
                    .map(user => ({...user, class: 'CS 101'})); // Add class info
                
                setClassmates(mockClassmates);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        
        loadData();
    }, []);

    // Add a friend by email
    const handleAddFriend = () => {
        if (friendEmail.trim() === '') return;
        
        // Mock adding a friend - in a real app this would send a request to the backend
        const newFriend = {
            id: users.length + 1,
            name: friendEmail.split('@')[0], // Generate a name from the email
            email: friendEmail
        };
        
        setUsers(prevUsers => [...prevUsers, newFriend]);
        setFriendEmail('');
        setShowAddFriendPopup(false);
    };
    
    // Add classmate to friends list
    const addClassmateToFriends = (classmate) => {
        // Check if the classmate is already in the friends list
        if (!users.some(user => user.id === classmate.id)) {
            setUsers(prevUsers => [...prevUsers, classmate]);
        }
    };

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
                                <li onClick={() => showNotImplementedFeature("Settings")}><i className="fas fa-cog"></i> Settings</li>
                                <li onClick={() => showNotImplementedFeature("Edit Profile")}><i className="fas fa-user-edit"></i> Edit Profile</li>
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
                        <button className="add-button" onClick={() => showNotImplementedFeature("Create New Group")}>
                            <i className="fas fa-plus" style={{paddingLeft: '10px'}}></i> Create New Group
                        </button>
                    </div>
                    <h4>Study Groups</h4>
                    {studyGroups.length > 0 ? (
                        <ul>
                            {studyGroups.map((group, index) => (
                                <li key={index} onClick={() => showNotImplementedFeature(`${group.name} Group`)}>
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
                    <input type="text" placeholder="Search friends..." onChange={() => showNotImplementedFeature("Search Friends")} />
                </div>
                <div className="friends-list">
                    {users.length > 0 ? (
                        <ul>
                            {users.filter(user => user.name !== (userData?.name || '')).map((user, index) => (
                                <li key={index} onClick={() => showNotImplementedFeature(`Chat with ${user.name}`)}>
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
                    <button className="action-button" onClick={() => setShowAddFriendPopup(true)}>
                        <i className="fas fa-user-plus "></i> Add Friend
                    </button>
                </div>
                
                {/* Classmates Section */}
                <h4 className="section-title">Classmates</h4>
                <div className="classmates-list">
                    {classmates.length > 0 ? (
                        <ul>
                            {classmates.map((classmate, index) => (
                                <li key={index} className="classmate-item">
                                    <div className="classmate-info" onClick={() => showNotImplementedFeature(`View ${classmate.name}'s Profile`)}>
                                        <i className="fas fa-user-graduate"></i>
                                        <span>{classmate.name}</span>
                                        <small className="class-label">{classmate.class}</small>
                                    </div>
                                    <button 
                                        className="add-classmate-button"
                                        onClick={() => addClassmateToFriends(classmate)}
                                        style={{fontSize: '20px'}}
                                    >
                                        +
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No classmates found</p>
                    )}
                </div>
                
                {/* Add Friend Popup */}
                {showAddFriendPopup && (
                    <div className="popup-overlay">
                        <div className="add-friend-popup">
                            <div className="popup-header">
                                <h3>Add Friend</h3>
                                <button className="close-button" onClick={() => setShowAddFriendPopup(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="popup-content">
                                <label htmlFor="friendEmail">Friend's Email:</label>
                                <input 
                                    type="email" 
                                    id="friendEmail" 
                                    value={friendEmail} 
                                    onChange={(e) => setFriendEmail(e.target.value)}
                                    placeholder="Enter email address" 
                                />
                                <div className="popup-actions">
                                    <button className="cancel-button" onClick={() => setShowAddFriendPopup(false)}>
                                        Cancel
                                    </button>
                                    <button className="add-button" onClick={handleAddFriend}>
                                        Add Friend
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                                <li key={index} className="assignment-item" onClick={() => showNotImplementedFeature(`View Assignment: ${assignment.title}`)}>
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
                                <li key={index} className="time-slot-item" onClick={() => showNotImplementedFeature("Manage Free Time")}>
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
            
            {/* Add the NotImplementedPopup */}
            <NotImplementedPopup 
                isOpen={notImplementedPopup.isOpen} 
                onClose={closeNotImplementedPopup} 
                featureName={notImplementedPopup.featureName} 
            />
        </div>
    );
}