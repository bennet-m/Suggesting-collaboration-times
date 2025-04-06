import SuggestedMeeting from "../Components/SuggestedMeeting";

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#4285F4', marginBottom: '1rem' }}>
        Suggested
      </h1>

      {/* 1st Example */}
      <div style={{ marginBottom: '20px' }}>
        <SuggestedMeeting
          suggestedMeeting={{
            title: "Partner Work Sesh",
            date: "April 12",
            time: "7 - 9 PM",
            dueDate: "April 17"
          }}
          bgColor="##9EF8EE" // Teal
          onAdd={() => console.log("Added Partner Work Sesh")}
        />
      </div>

      {/* 2nd Example */}
      <div style={{ marginBottom: '20px' }}>
        <SuggestedMeeting
          suggestedMeeting={{
            title: "Project Sync",
            date: "April 14",
            time: "1 - 2 PM",
            dueDate: "April 16"
          }}
          bgColor = "#FA7F08" // Orange
          onAdd={() => console.log("Added Project Sync")}
        />
      </div>

      {/* 3rd Example */}
      <div style={{ marginBottom: '20px' }}>
        <SuggestedMeeting
          suggestedMeeting={{
            title: "Reading Group",
            date: "April 15",
            time: "5 - 6 PM",
            dueDate: "April 18"
          }}
          bgColor = "#F24405" // Sunset Orange
          onAdd={() => console.log("Added Reading Group")}
        />
      </div>
    </div>
  );
}
