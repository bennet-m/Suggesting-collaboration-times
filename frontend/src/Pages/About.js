export default function About() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#4285F4', marginBottom: '1rem' }}>About StudySync</h1>
            
            <div style={{ marginTop: '2rem', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                    StudySync is a collaboration platform designed to help students coordinate study sessions by finding the perfect time to work together on assignments.
                </p>
                
                <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', color: '#4285F4' }}>Our Mission</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    Our mission is to streamline the process of finding time to work on group assignments. By connecting to your Google Calendar, we automatically identify when you and your classmates are all available, making it easier than ever to schedule productive study sessions.
                </p>
                
                <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', color: '#4285F4' }}>Key Features</h2>
                <ul style={{ listStyleType: 'disc', marginLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Track assignments and due dates</li>
                    <li style={{ marginBottom: '0.5rem' }}>Connect with Google Calendar for availability</li>
                    <li style={{ marginBottom: '0.5rem' }}>Find matching free time slots with classmates</li>
                    <li style={{ marginBottom: '0.5rem' }}>Organize study sessions around shared assignments</li>
                </ul>
                
                <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', color: '#4285F4' }}>How It Works</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    StudySync uses Google Calendar integration to fetch your schedule and identify free time slots. It then matches your availability with other students working on the same assignments to suggest optimal collaboration times.
                </p>
                <ol style={{ marginLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Add your assignments to the platform</li>
                    <li style={{ marginBottom: '0.5rem' }}>Connect your Google Calendar</li>
                    <li style={{ marginBottom: '0.5rem' }}>Specify your free time slots</li>
                    <li style={{ marginBottom: '0.5rem' }}>Find matching times with classmates</li>
                    <li style={{ marginBottom: '0.5rem' }}>Schedule and organize productive study sessions</li>
                </ol>
            </div>
            
            <div style={{ 
                marginTop: '3rem', 
                backgroundColor: '#f8f9fa', 
                padding: '1.5rem', 
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ready to get started?</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    Start adding your assignments and connect your calendar to find the best collaboration times.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href="/assignments" style={{ 
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}>
                        Manage Assignments
                    </a>
                    <a href="/calendar" style={{ 
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#34A853',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}>
                        Setup Calendar
                    </a>
                </div>
            </div>
        </div>
    );
} 