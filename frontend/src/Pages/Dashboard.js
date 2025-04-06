import React, { useState, useEffect } from 'react';
import SuggestedMeeting from "../Components/SuggestedMeeting";

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

export default function Dashboard() {
  // State to track upcoming meetings
  const [upcomingMeetings, setUpcomingMeetings] = useState([
    // Pre-populate with one example meeting
    {
      id: 'existing-1',
      title: "CS Final Review",
      date: `Fri, April 19, ${currentYear}`,
      time: "4 PM - 6 PM",
      dueDate: `April 22, ${currentYear}`,
      assignment: "CS Final",
      attendees: formatAttendeesWithEmails("Nico, AJ, Bennet"),
      location: "Kravis Center, Room 321",
      colorScheme: colorSchemes.upcoming,
      isNew: false
    }
  ]);

  // State to track all suggested meetings (so we can filter out accepted ones)
  const [suggestedMeetings, setSuggestedMeetings] = useState([
    {
      id: 'suggested-1',
      title: "Partner Work Sesh",
      date: `Sun, April 12, ${currentYear}`,
      time: "7 PM - 9 PM",
      dueDate: `April 17, ${currentYear}`,
      assignment: "HW 6",
      attendees: formatAttendeesWithEmails("Nico, Marilyn, AJ, Bennet"),
      location: "Millikan Lab, Room 2024",
      colorScheme: colorSchemes.study
    },
    {
      id: 'suggested-2',
      title: "Project Sync",
      date: `Mon, April 14, ${currentYear}`,
      time: "1 PM - 2 PM",
      dueDate: `April 16, ${currentYear}`,
      assignment: "Project 3",
      attendees: formatAttendeesWithEmails("Farah, John, Jane"),
      location: "Zoom: https://zoom.us/j/123456789",
      colorScheme: colorSchemes.project
    },
    {
      id: 'suggested-3',
      title: "Reading Group",
      date: `Tue, April 15, ${currentYear}`,
      time: "5 - 6 PM",
      dueDate: `April 18, ${currentYear}`,
      assignment: "Reading 4",
      attendees: formatAttendeesWithEmails("Jenny, Sabrina, Eli, Dana"),
      location: "Library Study Room 303",
      colorScheme: colorSchemes.event
    },
    {
      id: 'suggested-4',
      title: "Final Review",
      date: `Wed, April 16, ${currentYear}`,
      time: "3 PM - 5 PM",
      dueDate: `April 19, ${currentYear}`,
      assignment: "Final Exam",
      attendees: formatAttendeesWithEmails("Jim, Bob, Alice, Charlie"),
      location: "Academic Building, Room 101",
      colorScheme: colorSchemes.deadline
    },
    {
      id: 'suggested-5',
      title: "Study Break Coffee",
      date: `Thu, April 17, ${currentYear}`,
      time: "10 AM - 11 AM",
      dueDate: "No deadline",
      assignment: "Social",
      attendees: formatAttendeesWithEmails("Dana, Eli, Sabrina, Jenny"),
      location: "Campus Coffee Shop",
      colorScheme: colorSchemes.casual
    }
  ]);
  
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
  
  // Function to check if a meeting has already been added to upcoming
  const isMeetingAlreadyAdded = (meetingId) => {
    return upcomingMeetings.some(
      upcomingMeeting => 
        // If the meeting was explicitly added from suggested
        upcomingMeeting.originalId === meetingId || 
        // Match by assignment name and date as fallback
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

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      position: 'relative'
    }}>
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

      {/* Filter out meetings that have already been added to upcoming */}
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
      
      {/* Message when all suggested meetings have been added */}
      {suggestedMeetings.every(meeting => isMeetingAlreadyAdded(meeting.id)) && (
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
