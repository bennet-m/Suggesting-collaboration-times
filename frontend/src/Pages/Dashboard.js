import React, { useState, useEffect } from 'react';
import SuggestedMeeting from "../Components/SuggestedMeeting";
import { useNavigate } from 'react-router-dom';

// Color schemes based on different themes
const colorSchemes = {
  study: {
    main: '#4355BE', // Deep Blue
    accent: '#6D5BF8', // Purple Blue
    text: '#ffffff', // White
    stripe: 'rgba(109, 91, 248, 0.8)' // Brighter accent for stripe
  },
  project: {
    main: '#107896', // Ocean Blue
    accent: '#00CCBB', // Teal
    text: '#ffffff', // White
    stripe: 'rgba(0, 204, 187, 0.8)' // Brighter accent for stripe
  },
  event: {
    main: '#514D7A', // Deep Purple
    accent: '#B67AD4', // Lavender
    text: '#ffffff', // White
    stripe: 'rgba(182, 122, 212, 0.8)' // Brighter accent for stripe
  },
  deadline: {
    main: '#963A2F', // Deep Red
    accent: '#FF6B5E', // Coral
    text: '#ffffff', // White
    stripe: 'rgba(255, 107, 94, 0.8)' // Brighter accent for stripe
  },
  casual: {
    main: '#2B8C67', // Forest Green
    accent: '#47D185', // Mint
    text: '#ffffff', // White
    stripe: 'rgba(71, 209, 133, 0.8)' // Brighter accent for stripe  
  },
  // Special theme for upcoming meetings
  upcoming: {
    main: '#45505E', // Slate Gray
    accent: '#5D7AC0', // Steel Blue
    text: '#ffffff', // White
    stripe: 'rgba(93, 122, 192, 0.8)' // Brighter accent for stripe
  }
};

// Current user info
const BACKEND_URL = 'http://127.0.0.1:5000';

// Function to format attendees with email addresses
const formatAttendees = (emails) => {
  if (!emails || !emails.length) return "No attendees";
  
  return emails.map(email => {
    const name = email.split('@')[0].replace(/\./g, ' ');
    return `${name.charAt(0).toUpperCase() + name.slice(1)} <${email}>`;
  }).join(', ');
};

export default function Dashboard() {
  const navigate = useNavigate();
  // State for user data
  const [currentUser, setCurrentUser] = useState(null);
  // State for suggestions from backend
  const [suggestedMeetings, setSuggestedMeetings] = useState([]);
  // State for upcoming meetings (saved suggestions)
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  // State for loading indicators
  const [isLoading, setIsLoading] = useState(true);
  // State to track if a confirmation message should be shown
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  
  // Effect to automatically hide confirmation after 3 seconds
  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfirmation]);

  // Effect to check localStorage for user on mount
  useEffect(() => {
    // Get the user data from localStorage (set by Login.js)
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    
    if (email && name) {
      // First try to get the user data from the backend (if authenticated with Google)
      fetchUserDataFromBackend()
        .then(userData => {
          if (userData) {
            // Successfully fetched user data from backend (Google authenticated)
            console.log('Retrieved user data from backend');
          } else {
            // No authenticated user in the backend, use localStorage data
            console.log('Using localStorage user data');
            const user = {
              name: name,
              email: email,
              assignments: [],
              free_time: []
            };
            
            setCurrentUser(user);
            
            // Register the user with the backend if needed
            registerUserWithBackend(user);
            
            // Fetch suggestions for this user
            fetchSuggestions(user);
          }
        })
        .catch(error => {
          console.error('Error fetching user data from backend:', error);
          // Fallback to using localStorage data
          const user = {
            name: name,
            email: email,
            assignments: [],
            free_time: []
          };
          
          setCurrentUser(user);
          
          // Register the user with the backend if needed
          registerUserWithBackend(user);
          
          // Fetch suggestions for this user
          fetchSuggestions(user);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // No user found, redirect to login
      navigate('/login');
    }
  }, [navigate]);
  
  // Function to register user with backend
  const registerUserWithBackend = async (user) => {
    try {
      // Create a new user or fetch existing user
      const response = await fetch(`${BACKEND_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to register user with backend');
      }
    } catch (error) {
      console.error('Error registering user:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear backend session for Google OAuth
      await fetch(`${BACKEND_URL}/logout`, {
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error logging out from backend:', error);
    } finally {
      // Clear localStorage regardless of backend success
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      navigate('/login');
    }
  };
  
  // Function to fetch user data from the backend
  const fetchUserDataFromBackend = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/current-user`, {
        method: 'GET',
        credentials: 'include', // Include cookies for session
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      // If we got valid user data
      if (data.user) {
        setCurrentUser(data.user);
        
        // If we have suggestions, set them too
        if (data.suggestions) {
          const formattedSuggestions = formatSuggestionsFromBackend(data.suggestions);
          setSuggestedMeetings(formattedSuggestions);
        }
        
        return data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };
  
  // Format suggestions from the backend
  const formatSuggestionsFromBackend = (backendSuggestions) => {
    return backendSuggestions.map((suggestion, index) => {
      // Parse the start and end times
      const startTime = new Date(suggestion.start);
      const endTime = new Date(suggestion.end);
      const dueDate = new Date(suggestion.due);
      
      // Format the date and time strings
      const date = startTime.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
      
      const time = `${startTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })} - ${endTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
      
      const dueDateFormatted = dueDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Choose a color scheme based on the index
      const colorSchemeKeys = Object.keys(colorSchemes);
      const colorScheme = colorSchemes[colorSchemeKeys[index % colorSchemeKeys.length]];
      
      // Get the assignment title from the backend
      const title = suggestion.assignment;
      
      return {
        id: `suggested-${index}`,
        title: `${title} Work Session`,
        date: date,
        time: time,
        dueDate: dueDateFormatted,
        assignment: title,
        attendees: formatAttendees([currentUser.email]), // In a real app, this would include collaborator emails
        location: "TBD - Click to add", // Placeholder
        colorScheme: colorScheme,
        // Store the raw data for when adding to upcoming
        rawData: suggestion
      };
    });
  };
  
  // Function to fetch suggestions from backend
  const fetchSuggestions = async (user) => {
    if (!user || !user.email) {
      console.error('Cannot fetch suggestions: No user email available');
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`Error ${response.status}: ${errorData.error || response.statusText}`);
        
        // Show a friendly error message to the user
        setConfirmationMessage(`Could not load suggestions. Please try again later.`);
        setShowConfirmation(true);
        setSuggestedMeetings([]);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (!data.suggestions || data.suggestions.length === 0) {
        setSuggestedMeetings([]);
        setIsLoading(false);
        return;
      }
      
      // Transform the backend suggestions into our frontend format
      const formattedSuggestions = data.suggestions.map((suggestion, index) => {
        // Parse the start and end times
        const startTime = new Date(suggestion.start);
        const endTime = new Date(suggestion.end);
        const dueDate = new Date(suggestion.due);
        
        // Format the date and time strings
        const date = startTime.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });
        
        const time = `${startTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })} - ${endTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })}`;
        
        const dueDateFormatted = dueDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        
        // Choose a color scheme based on the index
        const colorSchemeKeys = Object.keys(colorSchemes);
        const colorScheme = colorSchemes[colorSchemeKeys[index % colorSchemeKeys.length]];
        
        // Get the assignment title from the backend
        const title = suggestion.assignment;
        
        return {
          id: `suggested-${index}`,
          title: `${title} Work Session`,
          date: date,
          time: time,
          dueDate: dueDateFormatted,
          assignment: title,
          attendees: formatAttendees([user.email]), // In a real app, this would include collaborator emails
          location: "TBD - Click to add", // Placeholder
          colorScheme: colorScheme,
          // Store the raw data for when adding to upcoming
          rawData: suggestion
        };
      });
      
      setSuggestedMeetings(formattedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      
      // Show a friendly error message to the user
      setConfirmationMessage(`Connection error. Please check your network.`);
      setShowConfirmation(true);
      
      setSuggestedMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to check if a meeting has already been added to upcoming
  const isMeetingAlreadyAdded = (meetingId) => {
    return upcomingMeetings.some(
      upcomingMeeting => 
        upcomingMeeting.originalId === meetingId || 
        (upcomingMeeting.assignment === suggestedMeetings.find(m => m.id === meetingId)?.assignment && 
         upcomingMeeting.date === suggestedMeetings.find(m => m.id === meetingId)?.date)
    );
  };
  
  // Function to add a meeting to upcoming meetings
  const handleAddToUpcoming = (meeting) => {
    // Create a copy of the meeting with a unique ID
    const upcomingMeeting = {
      ...meeting,
      id: `meeting-${Date.now()}`, // Create a unique ID based on timestamp
      originalId: meeting.id, // Track which suggested meeting this came from
      colorScheme: colorSchemes.upcoming, // Use upcoming color scheme
      isNew: true // Mark as new for animation
    };
    
    // Add to upcoming meetings state
    setUpcomingMeetings(prev => [...prev, upcomingMeeting]);
    
    // Show confirmation message
    setConfirmationMessage(`Added ${meeting.assignment} to your meetings`);
    setShowConfirmation(true);
    
    console.log(`Added ${meeting.assignment} to upcoming meetings`);
    
    // Remove the "new" flag after animation finishes
    setTimeout(() => {
      setUpcomingMeetings(prev => 
        prev.map(m => m.id === upcomingMeeting.id ? {...m, isNew: false} : m)
      );
    }, 1000);
  };
  
  // Function to remove a meeting from upcoming meetings
  const handleRemoveMeeting = (id, assignmentName) => {
    setUpcomingMeetings(prev => prev.filter(meeting => meeting.id !== id));
    
    // Show confirmation message
    setConfirmationMessage(`Removed ${assignmentName} from your meetings`);
    setShowConfirmation(true);
    
    console.log(`Removed meeting ${id} from upcoming meetings`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* User info and logout */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>Hello, {currentUser.name}</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#666' }}>{currentUser.email}</p>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f2f2f2',
            color: '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e0e0e0';
            e.currentTarget.style.color = '#333';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f2f2f2';
            e.currentTarget.style.color = '#666';
          }}
        >
          Sign Out
        </button>
      </div>
      
      {/* Confirmation message */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 100,
          animation: 'fadeInUp 0.3s ease forwards',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          {confirmationMessage}
        </div>
      )}
      
      {/* Suggested Meetings Section */}
      <h1 style={{ 
        fontSize: '3rem', 
        color: '#4285F4', 
        marginBottom: '1.5rem', 
        textAlign: 'left',
        fontWeight: '700',
        borderBottom: '3px solid #e1e4e8',
        paddingBottom: '0.5rem'
      }}>
        Suggested
      </h1>

      {/* Show suggestions from the backend */}
      {suggestedMeetings.length > 0 ? (
        suggestedMeetings
          .filter(meeting => !isMeetingAlreadyAdded(meeting.id))
          .map(meeting => (
            <div key={meeting.id} style={{ marginBottom: '24px' }}>
              <SuggestedMeeting
                suggestedMeeting={{
                  title: meeting.title,
                  date: meeting.date,
                  time: meeting.time,
                  dueDate: meeting.dueDate,
                  assignment: meeting.assignment,
                  attendees: meeting.attendees,
                  location: meeting.location
                }}
                colorScheme={meeting.colorScheme}
                onAdd={() => handleAddToUpcoming(meeting)}
              />
            </div>
          ))
      ) : (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#666',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>No suggestions available</h3>
          <p style={{ margin: 0, fontSize: '1rem' }}>You don't have any suggested meetings at this time.</p>
        </div>
      )}
      
      {/* Message when all suggested meetings have been added */}
      {suggestedMeetings.length > 0 && suggestedMeetings.every(meeting => isMeetingAlreadyAdded(meeting.id)) && (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#666',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>All caught up!</h3>
          <p style={{ margin: 0, fontSize: '1rem' }}>You've added all suggested meetings to your calendar.</p>
        </div>
      )}
      
      {/* Upcoming Meetings Section */}
      {upcomingMeetings.length > 0 && (
        <>
          <h1 style={{ 
            fontSize: '3rem', 
            color: '#5D7AC0', 
            marginTop: '3rem',
            marginBottom: '1.5rem', 
            textAlign: 'left',
            fontWeight: '700',
            borderBottom: '3px solid #e1e4e8',
            paddingBottom: '0.5rem'
          }}>
            Upcoming Meetings
          </h1>
          
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes fadeInUp {
                from { opacity: 0; transform: translate(-50%, 20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
              }
              .new-meeting {
                animation: fadeIn 0.5s ease forwards;
              }
              @keyframes slideInRight {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
              }
              @keyframes fadeScale {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}
          </style>
          
          {upcomingMeetings.map((meeting) => (
            <div 
              key={meeting.id} 
              style={{ 
                marginBottom: '24px', 
                position: 'relative'
              }}
              className={meeting.isNew ? 'new-meeting' : ''}
            >
              {/* Remove button */}
              <button
                onClick={() => handleRemoveMeeting(meeting.id, meeting.assignment)}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#666',
                  border: '1px solid #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transform: 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
                  e.currentTarget.style.color = '#ff3b30';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                  e.currentTarget.style.color = '#666';
                }}
              >
                ✕
              </button>
              
              <SuggestedMeeting
                suggestedMeeting={{
                  title: meeting.title,
                  date: meeting.date,
                  time: meeting.time,
                  dueDate: meeting.dueDate,
                  assignment: meeting.assignment,
                  attendees: meeting.attendees,
                  location: meeting.location
                }}
                colorScheme={meeting.colorScheme || colorSchemes.upcoming}
                onAdd={() => window.open(`https://calendar.google.com/calendar`, '_blank')}
                isUpcoming={true}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
