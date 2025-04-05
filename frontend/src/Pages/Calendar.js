import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Calendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const location = useLocation();
    const [freeTimeSlots, setFreeTimeSlots] = useState([
        { id: 1, start: "2025-04-06T14:00", end: "2025-04-06T15:00" },
        { id: 2, start: "2025-04-07T16:00", end: "2025-04-07T17:00" },
        { id: 3, start: "2025-04-08T10:00", end: "2025-04-08T11:00" }
    ]);

    // Check if user is connected and fetch events if yes
    useEffect(() => {
        // Check if we're returning from OAuth flow
        if (location.search.includes('code=')) {
            // If there's a code parameter, we've returned from Google OAuth
            setLoading(true);
            // Give the backend a moment to process the OAuth callback
            setTimeout(() => {
                checkCalendarConnection();
            }, 1000);
        } else {
            checkCalendarConnection();
        }
    }, [location]);

    const checkCalendarConnection = async () => {
        try {
            setLoading(true);
            // Try to fetch calendar events with proper CORS configuration
            const response = await fetch('http://localhost:5000/calendar', {
                credentials: 'include', // This sends cookies
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
                setConnected(true);
            } else if (response.status === 403) {
                console.log('Not authenticated with Google Calendar yet');
                setConnected(false);
            }
        } catch (error) {
            console.error('Not connected to calendar:', error);
            setConnected(false);
        } finally {
            setLoading(false);
        }
    };

    // Format date range for display
    const formatTimeRange = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        const dateStr = startDate.toLocaleDateString();
        const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `${dateStr}, ${startTime} - ${endTime}`;
    };

    const handleConnectCalendar = () => {
        // Open the login URL in a new tab to avoid CORS issues with redirects
        window.open('http://localhost:5000/login', '_blank');
        
        // Inform the user to check the new tab
        alert("Please complete the Google sign-in process in the new tab. After completing, return to this page and refresh to see your calendar data.");
    };

    const formatEventTime = (event) => {
        if (!event.start || !event.end) return 'Time not specified';
        
        const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
        const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
        
        const dateStr = start.toLocaleDateString();
        const startTime = event.start.dateTime 
            ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'All day';
        const endTime = event.end.dateTime 
            ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
            
        return event.start.dateTime 
            ? `${dateStr}, ${startTime} - ${endTime}`
            : `${dateStr} (All day)`;
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.2rem', color: '#4285F4', marginBottom: '1.5rem' }}>
                Calendar Integration
            </h1>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Loading...</p>
                </div>
            ) : !connected ? (
                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '2rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginTop: '2rem'
                }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#4285F4' }}>Connect Your Google Calendar</h2>
                    <p style={{ marginBottom: '2rem' }}>
                        Connect your Google Calendar to find the best collaboration times with classmates.
                        This will allow StudySync to view your calendar events and suggest free time slots.
                    </p>
                    <button 
                        onClick={handleConnectCalendar}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            margin: '0 auto',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        <span style={{ marginRight: '0.5rem' }}>🔄</span>
                        Connect Google Calendar
                    </button>
                    
                    <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Why connect your calendar?</h3>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Find common free times with classmates</li>
                            <li style={{ marginBottom: '0.5rem' }}>Schedule study sessions around assignments</li>
                            <li style={{ marginBottom: '0.5rem' }}>Get automated suggestions for collaboration</li>
                            <li>We only access your calendar data to find free times - your data is never shared</li>
                        </ul>
                    </div>
                    
                    <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', border: '1px solid #f8d7da', borderRadius: '4px', backgroundColor: '#fff3f3' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#721c24' }}>Troubleshooting</h3>
                        <p style={{ marginBottom: '1rem' }}>
                            If you encounter any issues connecting your calendar:
                        </p>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Make sure you're allowing cookies from our site</li>
                            <li style={{ marginBottom: '0.5rem' }}>Try accessing the backend directly <a href="http://localhost:5000/login" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>here</a></li>
                            <li style={{ marginBottom: '0.5rem' }}>After authorizing, return to this page and refresh</li>
                            <li>If issues persist, <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>manage your Google account permissions</a> and try again</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ 
                        backgroundColor: '#e8f5e9', 
                        padding: '1rem', 
                        borderRadius: '4px', 
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span style={{ 
                            backgroundColor: '#4CAF50', 
                            color: 'white', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '50%', 
                            marginRight: '1rem'
                        }}>✓</span>
                        <p>Your Google Calendar is connected! You can now manage your free time slots.</p>
                    </div>
                
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ marginBottom: '1rem', color: '#4285F4' }}>Your Calendar Events</h2>
                        <p style={{ marginBottom: '1.5rem' }}>Recent events from your Google Calendar:</p>
                        
                        {events.length > 0 ? (
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                                {events.map((event, index) => (
                                    <div key={index} style={{ 
                                        padding: '0.75rem 1rem', 
                                        borderBottom: index < events.length - 1 ? '1px solid #e0e0e0' : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{event.summary || 'Untitled Event'}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>{formatEventTime(event)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No upcoming events found in your calendar.</p>
                        )}
                    </div>
                
                    <div>
                        <h2 style={{ marginBottom: '1rem', color: '#4285F4' }}>Your Free Time Slots</h2>
                        <p style={{ marginBottom: '1.5rem' }}>Add your available times for collaboration:</p>
                        
                        {freeTimeSlots.length > 0 ? (
                            <div style={{ marginBottom: '1.5rem' }}>
                                {freeTimeSlots.map(slot => (
                                    <div key={slot.id} style={{
                                        padding: '0.75rem 1rem',
                                        marginBottom: '0.5rem',
                                        backgroundColor: '#e8f0fe',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <span style={{ marginRight: '0.5rem' }}>🕒</span>
                                            {formatTimeRange(slot.start, slot.end)}
                                        </div>
                                        <button style={{
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}>
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ marginBottom: '1.5rem' }}>No free time slots added yet.</p>
                        )}
                        
                        <button style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            Add Free Time Slot
                        </button>
                    </div>
                    
                    <div style={{ 
                        marginTop: '3rem',
                        padding: '1.5rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                    }}>
                        <h2 style={{ marginBottom: '1rem', color: '#4285F4' }}>Find Matching Times</h2>
                        <p style={{ marginBottom: '1.5rem' }}>Find common free time slots with classmates working on the same assignments:</p>
                        
                        <button style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#34A853',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                            Find Collaboration Times
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}