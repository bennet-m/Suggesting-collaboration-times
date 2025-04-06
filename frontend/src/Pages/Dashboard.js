import React, { useState, useEffect } from 'react';
import SuggestedMeeting from "../Components/SuggestedMeeting";
import backgroundImage from '../Assets/Images/Bookclp.png';

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

// Attendee data with names and email addresses
const attendeeData = {
  'Bob': 'bob.smith@example.com',
  'Alice': 'alice.johnson@example.com',
  'Charlie': 'charlie.brown@example.com',
  'Farah': 'farah.ahmed@example.com',
  'John': 'john.doe@example.com',
  'Jane': 'jane.miller@example.com',
  'Jenny': 'jenny.wilson@example.com',
  'Sabrina': 'sabrina.chen@example.com',
  'Eli': 'eli.rodriguez@example.com',
  'Dana': 'dana.patel@example.com',
  'Jim': 'jim.thompson@example.com',
  'Nico': 'nriley72@cmc.edu',
  'Marilyn': 'mma98@cmc.edu',
  'AJ': 'amatheson53@cmc.edu',
  'Bennet': 'bmatazzoni@hmc.edu'
};

// Current user's name and email
const currentUser = {
  name: 'You',
  email: 'your.email@example.com'
};

// Get current year to use in all dates
const currentYear = new Date().getFullYear();

// Function to format attendees with email addresses
const formatAttendeesWithEmails = (attendeeNames) => {
  const nameArray = attendeeNames.split(',').map(name => name.trim());
  // Add the current user to the attendees list
  const allAttendees = [currentUser.name, ...nameArray];
  
  return allAttendees.map(name => {
    if (name === currentUser.name) {
      return `${name} <${currentUser.email}>`;
    }
    const email = attendeeData[name] || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    return `${name} <${email}>`;
  }).join(', ');
};

export default function Dashboard({ userData }) {
  // State to track upcoming meetings
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [suggestedMeetings, setSuggestedMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching suggestions for user:", userData);
        
        const response = await fetch('http://127.0.0.1:5000/api/suggestions', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log("Suggestions response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.status}`);
        }

        const data = await response.json();
        console.log("Suggestions data received:", data);
        
        if (!data.suggestions || !Array.isArray(data.suggestions)) {
          throw new Error('Invalid suggestions data received');
        }

        // Transform the suggestions into the format expected by the UI
        const formattedSuggestions = data.suggestions.map((suggestion, index) => {
          const startDate = new Date(suggestion.start);
          const endDate = new Date(suggestion.end);
          const dueDate = new Date(suggestion.due);
          
          // Format time with explicit timezone handling
          const formatTime = (date) => {
            // Create a new date object to avoid modifying the original
            const adjustedDate = new Date(date);
            
            // If the hour is before 9am, set it to 9am
            if (adjustedDate.getHours() < 9) {
              adjustedDate.setHours(9);
              adjustedDate.setMinutes(0);
            }
            
            return adjustedDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'America/Los_Angeles' // Adjust this to your desired timezone
            });
          };
          
          return {
            id: `suggested-${index}`,
            title: suggestion.assignment,
            date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }),
            time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
            dueDate: dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            assignment: suggestion.assignment,
            attendees: formatAttendeesWithEmails("Classmates"),
            location: "To be determined",
            colorScheme: colorSchemes.study
          };
        });

        console.log("Formatted suggestions:", formattedSuggestions);
        setSuggestedMeetings(formattedSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      console.log("User data available, fetching suggestions");
      fetchSuggestions();
    } else {
      console.log("No user data available, skipping suggestions fetch");
      setLoading(false);
    }
  }, [userData]);

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
    const upcomingMeeting = {
      ...meeting,
      id: `meeting-${Date.now()}`,
      originalId: meeting.id,
      colorScheme: colorSchemes.upcoming,
      isNew: true
    };
    
    setUpcomingMeetings(prev => [...prev, upcomingMeeting]);
    
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
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h3>Loading suggestions...</h3>
          <p>Please wait while we find the best times for collaboration.</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderRadius: '12px',
          marginBottom: '2rem',
          color: '#721c24'
        }}>
          <h3>Error loading suggestions</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Suggested Meetings Section */}
      {!loading && !error && (
        <>
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

          {suggestedMeetings
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
          }
          
          {suggestedMeetings.every(meeting => isMeetingAlreadyAdded(meeting.id)) && (
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#666',
              marginBottom: '2rem'
            }}>
              <h3>All caught up!</h3>
              <p>You've added all suggested meetings to your calendar.</p>
            </div>
          )}
        </>
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
              .new-meeting {
                animation: fadeIn 0.5s ease forwards;
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
