export default function Dashboard() {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#4285F4', marginBottom: '1rem' }}>
                Welcome to StudySync
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                Find the perfect time to collaborate with classmates on assignments
            </p>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                <div style={{ 
                    flex: '1 1 300px', 
                    backgroundColor: '#f8f9fa', 
                    padding: '1.5rem', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#4285F4', marginBottom: '1rem' }}>
                        <span style={{ marginRight: '0.5rem' }}>📝</span>
                        Track Assignments
                    </h2>
                    <p>
                        Add your assignments and due dates to find classmates working on the same tasks.
                    </p>
                    <a href="/assignments" style={{ 
                        display: 'inline-block',
                        marginTop: '1rem',
                        color: '#4285F4',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                    }}>
                        Manage Assignments →
                    </a>
                </div>
                
            </div>
            
            <div style={{ 
                marginTop: '3rem', 
                backgroundColor: '#e8f0fe', 
                padding: '1.5rem', 
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    How It Works
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1 1 200px', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>1️⃣</div>
                        <p>Add your assignments</p>
                    </div>
                    <div style={{ flex: '1 1 200px', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>2️⃣</div>
                        <p>Connect your Google Calendar</p>
                    </div>
                    <div style={{ flex: '1 1 200px', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3️⃣</div>
                        <p>Find perfect collaboration times</p>
                    </div>
                </div>
            </div>
        </div>
    );
}