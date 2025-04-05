import { useState, useEffect } from 'react';

export default function Assignments() {
    // Sample assignments data - in a real app this would come from an API
    const [assignments, setAssignments] = useState([
        { id: 1, title: "CS225 Assignment 2", due: "2025-04-07T23:59", course: "CS225", status: "pending" },
        { id: 2, title: "MATH241 Quiz", due: "2025-04-09T12:00", course: "MATH241", status: "pending" }
    ]);

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Your Assignments</h1>
            <p>View and manage your upcoming assignments</p>
            
            <div style={{ marginTop: '2rem' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold'
                }}>
                    <div style={{ width: '40%' }}>Assignment</div>
                    <div style={{ width: '20%' }}>Course</div>
                    <div style={{ width: '30%' }}>Due Date</div>
                    <div style={{ width: '10%' }}>Status</div>
                </div>
                
                {assignments.map(assignment => (
                    <div key={assignment.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.5rem',
                        borderBottom: '1px solid #eee'
                    }}>
                        <div style={{ width: '40%' }}>{assignment.title}</div>
                        <div style={{ width: '20%' }}>{assignment.course}</div>
                        <div style={{ width: '30%' }}>{formatDate(assignment.due)}</div>
                        <div style={{ width: '10%' }}>
                            <span style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: assignment.status === 'completed' ? '#d4edda' : '#fff3cd',
                                color: assignment.status === 'completed' ? '#155724' : '#856404',
                                borderRadius: '4px',
                                fontSize: '0.8rem'
                            }}>
                                {assignment.status === 'completed' ? 'Completed' : 'Pending'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div style={{ marginTop: '2rem' }}>
                <button style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Add New Assignment
                </button>
            </div>
        </div>
    );
} 