import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import userService from '../services/userService';
import { useLocation, useNavigate } from 'react-router-dom';
import NotImplementedPopup from './NotImplementedPopup';
import StudyGroupModal from './StudyGroupModal';
import CreateStudyGroupModal from './CreateStudyGroupModal';
import AJ from "../Assets/Images/AJ.png"

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
    // New state variables for our study group modals
    const [showStudyGroupModal, setShowStudyGroupModal] = useState(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    // New state for event scheduling popup
    const [showSchedulePopup, setShowSchedulePopup] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [eventTitle, setEventTitle] = useState('');
    // Add toast notification state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    
    const location = useLocation();
    const navigate = useNavigate();
    
    // Study group colors
    const studyGroupColors = {
        main: '#4355BE', // Deep Blue
        accent: '#6D5BF8', // Purple Blue
        text: '#ffffff', // White
        stripe: 'rgba(109, 91, 248, 0.8)' // Brighter accent for stripe
    };
    
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
    
    // Function to handle opening study group modal
    const handleOpenGroupModal = (group) => {
        setSelectedGroup(group);
        setShowStudyGroupModal(true);
    };
    
    // Function to handle opening create group modal
    const handleOpenCreateModal = () => {
        setShowCreateGroupModal(true);
    };
    
    // Function to close study group modal
    const handleCloseGroupModal = () => {
        setShowStudyGroupModal(false);
    };
    
    // Function to close create group modal
    const handleCloseCreateModal = () => {
        setShowCreateGroupModal(false);
    };
    
    // Function to handle creating a new study group
    const handleCreateGroup = (newGroup) => {
        setStudyGroups([...studyGroups, newGroup]);
    };
    
    // Logout function
    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
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
                // Get the current user email from localStorage
                const userEmail = localStorage.getItem('userEmail');
                const userName = localStorage.getItem('userName');
                
                if (!userEmail) {
                    console.error('No user email found in localStorage');
                    return;
                }
                
                // Get the current user by email
                const currentUser = await userService.getUserByEmail(userEmail);
                
                // If the user doesn't have a name set yet (for backwards compatibility),
                // use the name from localStorage
                if (userName && (!currentUser.name || currentUser.name === userEmail.split('@')[0])) {
                    currentUser.name = userName;
                }
                
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
                
                // Get classmates using the new API
                const classmatesData = await userService.getClassmates(userEmail);
                
                // Convert classmates data to array format
                const classmatesArray = [];
                for (const [className, students] of Object.entries(classmatesData)) {
                    students.forEach(student => {
                        if (!classmatesArray.some(c => c.email === student.email)) {
                            classmatesArray.push({
                                ...student,
                                class: className
                            });
                        }
                    });
                }
                
                setClassmates(classmatesArray);
            } catch (error) {
                console.error('Error loading data:', error);
                
                // Set default classmates data if there's an error
                const mockClassmates = users
                    .filter(user => user.name !== (userData?.name || ''))
                    .slice(0, 3)
                    .map(user => ({...user, class: 'CS 101'}));
                
                setClassmates(mockClassmates);
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

    // Function to handle scheduling a time slot
    const handleScheduleTimeSlot = (timeSlot) => {
        setSelectedTimeSlot(timeSlot);
        setEventTitle('');
        setShowSchedulePopup(true);
    };
    
    // Function to show toast notification
    const showNotification = (message) => {
        setToastMessage(message);
        setShowToast(true);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };
    
    // Function to create Google Calendar event
    const createGoogleCalendarEvent = () => {
        if (!selectedTimeSlot || !eventTitle.trim()) return;
        
        try {
            // Format dates for Google Calendar (YYYYMMDDTHHMMSS format without timezone)
            const formatDateForGCal = (date) => {
                const pad = (num) => (num < 10 ? '0' + num : num);
                
                const year = date.getFullYear();
                const month = pad(date.getMonth() + 1);
                const day = pad(date.getDate());
                const hours = pad(date.getHours());
                const minutes = pad(date.getMinutes());
                
                return `${year}${month}${day}T${hours}${minutes}00`;
            };
            
            const startDate = new Date(selectedTimeSlot.start);
            const endDate = new Date(selectedTimeSlot.end);
            
            // Create the event title
            const title = encodeURIComponent(eventTitle.trim());
            
            // Create description with assignments if related
            const relatedAssignments = assignments.filter(a => 
                a.title.toLowerCase().includes(eventTitle.toLowerCase()) || 
                eventTitle.toLowerCase().includes(a.title.toLowerCase())
            );
            
            let description = encodeURIComponent(
                `Study session scheduled from your free time slots.${relatedAssignments.length > 0 ? 
                    `\n\nRelated assignments:\n${relatedAssignments.map(a => 
                        `- ${a.title} (Due: ${new Date(a.due).toLocaleString()})`
                    ).join('\n')}` : ''}`
            );
            
            // Format dates for Google Calendar
            const startDateFormatted = formatDateForGCal(startDate);
            const endDateFormatted = formatDateForGCal(endDate);
            
            // Create Google Calendar URL
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateFormatted}/${endDateFormatted}&details=${description}`;
            
            // Open the Google Calendar link in a new tab
            window.open(googleCalendarUrl, '_blank');
            
            // Close the popup
            setShowSchedulePopup(false);
            
            // Show success notification
            showNotification(`Event "${eventTitle}" added to Google Calendar!`);
            
        } catch (error) {
            console.error("Error creating Google Calendar link:", error);
            // If any error occurs, use a minimal fallback URL
            const minimalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}`;
            window.open(minimalUrl, '_blank');
            setShowSchedulePopup(false);
            
            // Show error notification
            showNotification("Unable to create event. Please try again.");
        }
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
                                {userData.email == "amatheson53@students.claremontmckenna.edu" ? // Shhhhh don't tell anyone that the only functioning photo is of me
                                <img src={AJ} alt="AJ" style={{width: '50px', height: '50px', borderRadius: '50%'}}/> 
                                :
                                <i className="fas fa-user-circle"></i>}
                            </div>
                            <div className="profile-info">
                                <h4 style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px'}}>{userData.name}</h4>
                                <p style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px'}}>{userData.email}</p>
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
                        <button className="add-button" onClick={handleOpenCreateModal}>
                            <i className="fas fa-plus" style={{paddingLeft: '10px'}}></i> Create New Group
                        </button>
                    </div>
                    <h4>Study Groups</h4>
                    {studyGroups.length > 0 ? (
                        <ul>
                            {studyGroups.map((group, index) => (
                                <li key={index} onClick={() => handleOpenGroupModal(group)}>
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
                                    style={{width: '90%'}}
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
                                <li key={index} className="time-slot-item" onClick={() => handleScheduleTimeSlot(slot)}>
                                    <i className="fas fa-calendar-plus"></i>
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
        width: isCollapsed ? '0' : '250px', 
        transition: 'all 0.3s ease', 
        position: 'fixed', 
        top: navbarVisible ? `${navbarHeight}px` : '0', 
        left: '0', 
        height: navbarVisible ? `calc(100% - ${navbarHeight}px)` : '100%', 
        zIndex: '100',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        margin: 0,
        padding: 0
    };

    // Toggle button position, ensure it's outside of the sidebar when collapsed
    const toggleButtonStyle = {
        position: 'fixed',
        top: navbarVisible ? `${navbarHeight + 20}px` : '20px', // Adjust for navbar height
        left: isCollapsed ? '10px' : '220px',
        zIndex: '120',
        transition: 'all 0.3s ease',
        background: isCollapsed ? '#f8f9fa' : 'transparent',
        padding: isCollapsed ? '8px' : '0',
        borderRadius: isCollapsed ? '5px' : '0',
        boxShadow: isCollapsed ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px'
    };

    return (
        <>
            <div className="sidebar-container" style={sidebarStyle}>
                <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} >
                    <div className="sidebar-header" style={{ height: '30px' }}>
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
            </div>
            <div style={toggleButtonStyle}>
                {isCollapsed ? (
                    <i className="fas fa-bars" onClick={onToggle} style={{cursor: 'pointer', fontSize: '20px'}}></i>
                ) : (
                    <i className="fas fa-times" onClick={onToggle} style={{cursor: 'pointer', fontSize: '20px'}}></i>
                )}
            </div>
            
            {/* Add the Study Group Modal */}
            <StudyGroupModal 
                isOpen={showStudyGroupModal}
                onClose={handleCloseGroupModal}
                group={selectedGroup}
                colorScheme={studyGroupColors}
            />
            
            {/* Add the Create Study Group Modal */}
            <CreateStudyGroupModal 
                isOpen={showCreateGroupModal}
                onClose={handleCloseCreateModal}
                onCreateGroup={handleCreateGroup}
                colorScheme={studyGroupColors}
            />
            
            {/* Add the NotImplementedPopup */}
            <NotImplementedPopup 
                isOpen={notImplementedPopup.isOpen} 
                onClose={closeNotImplementedPopup} 
                featureName={notImplementedPopup.featureName} 
            />
            
            {/* Schedule Time Slot Popup */}
            {showSchedulePopup && selectedTimeSlot && (
                <div className="popup-overlay">
                    <div className="add-friend-popup" style={{ maxWidth: "400px" }}>
                        <div className="popup-header">
                            <h3>Schedule Event</h3>
                            <button className="close-button" onClick={() => setShowSchedulePopup(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="popup-content">
                            <div style={{ marginBottom: "15px" }}>
                                <p style={{ margin: "0 0 8px 0", fontWeight: "500" }}>
                                    <i className="fas fa-clock" style={{ marginRight: "8px", color: "#3a86ff" }}></i>
                                    {formatDate(selectedTimeSlot.start)} - {new Date(selectedTimeSlot.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                            
                            <label htmlFor="eventTitle">Event Title:</label>
                            <input 
                                type="text" 
                                id="eventTitle" 
                                value={eventTitle} 
                                onChange={(e) => setEventTitle(e.target.value)}
                                placeholder="E.g., Study for MATH241"
                                style={{width: '90%', marginBottom: '15px'}}
                                autoFocus
                            />
                            
                            <p style={{ fontSize: "13px", color: "#666", margin: "0 0 15px 0" }}>
                                This event will be added to your Google Calendar.
                            </p>
                            
                            <div className="popup-actions">
                                <button className="cancel-button" onClick={() => setShowSchedulePopup(false)}>
                                    Cancel
                                </button>
                                <button 
                                    className="add-button" 
                                    onClick={createGoogleCalendarEvent}
                                    disabled={!eventTitle.trim()}
                                    style={{ 
                                        opacity: eventTitle.trim() ? 1 : 0.6,
                                        cursor: eventTitle.trim() ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <i className="fas fa-calendar-plus" style={{ marginRight: "8px" }}></i>
                                    Add to Calendar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Toast Notification */}
            {showToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    animation: 'fadeScale 0.3s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '18px' }}></i>
                    <span>{toastMessage}</span>
                </div>
            )}
        </>
    );
}