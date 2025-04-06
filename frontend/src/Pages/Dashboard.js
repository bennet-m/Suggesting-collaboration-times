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
            attendees: "John Doe, Jane Smith"
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
            attendees: "John Doe, Jane Smith"
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
            attendees: "John Doe, Jane Smith"
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
            attendees: "The Whole Class"
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
            attendees: "Study Group"
          }}
          colorScheme={colorSchemes.casual}
          onAdd={() => console.log("Added Study Break Coffee")}
        />
      </div>
    </div>
  );
}
