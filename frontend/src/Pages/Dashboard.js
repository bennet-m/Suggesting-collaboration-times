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
  'Jim': 'jim.thompson@example.com'
};

// Current user's name and email
const currentUser = {
  name: 'You',
  email: 'your.email@example.com'
};

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
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
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

      {/* 1st Example - Study group theme */}
      <div style={{ marginBottom: '24px' }}>
        <SuggestedMeeting
          suggestedMeeting={{
            title: "Partner Work Sesh",
            date: "Sun, April 12",
            time: "7 - 9 PM",
            dueDate: "April 17",
            assignment: "HW 6",
            attendees: formatAttendeesWithEmails("Bob, Alice, Charlie"),
            location: "Millikan Lab, Room 2024"
          }}
          colorScheme={colorSchemes.study}
          onAdd={() => console.log("Added Partner Work Sesh")}
        />
      </div>

      {/* 2nd Example - Project theme */}
      <div style={{ marginBottom: '24px' }}>
        <SuggestedMeeting
          suggestedMeeting={{
            title: "Project Sync",
            date: "Mon, April 14",
            time: "1 - 2 PM",
            dueDate: "April 16",
            assignment: "Project 3",
            attendees: formatAttendeesWithEmails("Farah, John, Jane"),
            location: "Zoom: https://zoom.us/j/123456789"
          }}
          colorScheme={colorSchemes.project}
          onAdd={() => console.log("Added Project Sync")}
        />
      </div>

      {/* 3rd Example - Event theme */}
      <div style={{ marginBottom: '24px' }}>
        <SuggestedMeeting
          suggestedMeeting={{
            title: "Reading Group",
            date: "Tue, April 15",
            time: "5 - 6 PM",
            dueDate: "April 18",
            assignment: "Reading 4",
            attendees: formatAttendeesWithEmails("Jenny, Sabrina, Eli, Dana"),
            location: "Library Study Room 303"
          }}
          colorScheme={colorSchemes.event}
          onAdd={() => console.log("Added Reading Group")}
        />
      </div>
      
      {/* 4th Example - Deadline theme */}
      <div style={{ marginBottom: '24px' }}>
        <SuggestedMeeting
          suggestedMeeting={{
            title: "Final Review",
            date: "Wed, April 16",
            time: "3 - 5 PM",
            dueDate: "April 19",
            assignment: "Final Exam",
            attendees: formatAttendeesWithEmails("Jim, Bob, Alice, Charlie"),
            location: "Academic Building, Room 101"
          }}
          colorScheme={colorSchemes.deadline}
          onAdd={() => console.log("Added Final Review")}
        />
      </div>
      
      {/* 5th Example - Casual theme */}
      <div style={{ marginBottom: '24px' }}>
        <SuggestedMeeting
          suggestedMeeting={{
            title: "Study Break Coffee",
            date: "Thu, April 17",
            time: "10 - 11 AM",
            dueDate: "No deadline",
            assignment: "Social",
            attendees: formatAttendeesWithEmails("Dana, Eli, Sabrina, Jenny"),
            location: "Campus Coffee Shop"
          }}
          colorScheme={colorSchemes.casual}
          onAdd={() => console.log("Added Study Break Coffee")}
        />
      </div>
    </div>
  );
}
