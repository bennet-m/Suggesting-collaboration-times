import SuggestedMeeting from "../Components/SuggestedMeeting";
export default function Dashboard() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#4285F4', marginBottom: '1rem' }}>
                Suggested
            </h1>
            <SuggestedMeeting 
            // Example Data
                suggestedMeeting = {{
                    title: "Partner Work Sesh" ,
                    date: "April 12" ,
                    time: "7 - 9 PM" ,
                    assignment: "HW3" ,
                    dueDate: "April 17" 
                }}
            />
        </div>
    );
}