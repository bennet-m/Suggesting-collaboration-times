import React, { useState } from 'react';
import { FaBook, FaCalendarAlt, FaClock, FaUsers, FaArrowRight, FaLightbulb, FaUserFriends } from 'react-icons/fa';
import Marilyn from '../Assets/Images/Marilyn.png';
import Bennet from '../Assets/Images/Bennet.png';
import AJ from '../Assets/Images/AJ.png';
import Nico from '../Assets/Images/Nico.png';

export default function About() {
    // Team member component with proper image fallback
    const TeamMember = ({ member, index }) => {
        const [imageError, setImageError] = useState(false);
        
        return (
            <div key={index} style={{ 
                textAlign: 'center', 
                maxWidth: '180px',
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease',
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '0 auto 1rem',
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #4285F4'
                }}>
                    {!imageError ? (
                        <img 
                            src={member.src} 
                            alt={member.name} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                            }} 
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div style={{
                            fontSize: '3rem',
                            color: '#4285F4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%'
                        }}>
                            {member.name.charAt(0)}
                        </div>
                    )}
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>{member.name}</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{member.role}</p>
            </div>
        );
    };

    // Team member data
    const teamMembers = [
        { name: 'Marilyn Ma (CMC \'27)', role: 'Backend Developer', src: Marilyn },
        { name: 'Bennet Matazzoni (HMC \'26)', role: 'Backend Developer', src: Bennet },
        { name: 'AJ Matheson-Lieber (CMC \'27)', role: 'UI/UX Designer and Frontend Developer', src: AJ },
        { name: 'Nico Riley (CMC \'27)', role: 'UI/UX Designer and Frontend Developer', src: Nico }
    ];

    return (
        <div className="about-container" style={{ 
            padding: '4rem 2rem', 
            maxWidth: '900px', 
            margin: '0 auto',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#333',
            lineHeight: '1.6'
        }}>
            <header style={{
                marginBottom: '3rem',
                textAlign: 'center'
            }}>
                <h1 style={{ 
                    fontSize: '3rem', 
                    background: 'linear-gradient(135deg, #4285F4, #34A853)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1.5rem' 
                }}>About StudySync</h1>
                <div style={{ 
                    height: '4px', 
                    width: '80px', 
                    background: 'linear-gradient(to right, #4285F4, #34A853)', 
                    margin: '0 auto',
                    borderRadius: '2px'
                }}></div>
            </header>
            
            <div style={{ 
                marginTop: '2rem', 
                lineHeight: '1.8',
                fontSize: '1.1rem' 
            }}>
                <p style={{ 
                    marginBottom: '2rem',
                    fontSize: '1.25rem',
                    color: '#555',
                    textAlign: 'center'
                }}>
                    StudySync is a collaboration platform designed to help students coordinate study sessions 
                    by finding the perfect time to work together on assignments.
                </p>
                
                {/* Our Mission Section */}
                <section style={{ 
                    marginBottom: '3rem',
                    background: 'linear-gradient(to right, rgba(66, 133, 244, 0.05), rgba(52, 168, 83, 0.05))',
                    padding: '2rem',
                    borderRadius: '12px',
                }}>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        color: '#4285F4',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{
                            background: '#4285F4',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FaLightbulb />
                        </span>
                        Our Mission
                    </h2>
                    <p style={{ 
                        marginBottom: '1.5rem',
                        paddingLeft: '1rem',
                        borderLeft: '3px solid #4285F4',
                        fontSize: '1.1rem'
                    }}>
                        Here at StudySync, we empower students by making collaboration easier than ever.
                        Our algorithm analyzes user calendar data and suggests shared work times. This makes it 
                        easier than ever to study together, plan group projects, and build meaningful academic connections.
                    </p>
                    <p style={{ 
                        paddingLeft: '1rem',
                        borderLeft: '3px solid #34A853',
                        fontSize: '1.1rem'
                    }}>
                        By connecting to your Google Calendar, we automatically identify when you and your classmates 
                        are all available, making it easier than ever to schedule productive study sessions.
                    </p>
                </section>
                
                {/* Meet the Team Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        color: '#4285F4',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        justifyContent: 'center'
                    }}>
                        <span style={{
                            background: '#4285F4',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FaUserFriends />
                        </span>
                        Meet the Team
                    </h2>
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        justifyContent: 'center', 
                        gap: '2rem', 
                        marginBottom: '2rem' 
                    }}>
                        {teamMembers.map((member, i) => (
                            <TeamMember key={i} member={member} index={i} />
                        ))}
                    </div>
                </section>
                
                {/* Key Features Section */}
                <section style={{
                    marginBottom: '3rem',
                    background: '#f8f9fa',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        color: '#4285F4',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{
                            background: '#4285F4',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FaUsers />
                        </span>
                        Key Features
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {[
                            { icon: <FaBook />, text: 'Track assignments and due dates' },
                            { icon: <FaCalendarAlt />, text: 'Connect with Google Calendar for availability' },
                            { icon: <FaClock />, text: 'Find matching free time slots with classmates' },
                            { icon: <FaUsers />, text: 'Organize study sessions around shared assignments' }
                        ].map((feature, i) => (
                            <div key={i} style={{
                                padding: '1.5rem',
                                background: 'white',
                                borderRadius: '10px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    color: '#34A853',
                                    fontSize: '2rem'
                                }}>{feature.icon}</div>
                                <div>{feature.text}</div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* How It Works Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        color: '#4285F4',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{
                            background: '#4285F4',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FaClock />
                        </span>
                        How It Works
                    </h2>
                    <p style={{ 
                        marginBottom: '1.5rem',
                        fontSize: '1.1rem',
                        maxWidth: '800px',
                        margin: '0 auto 2rem',
                        textAlign: 'center',
                        color: '#555'
                    }}>
                        StudySync uses Google Calendar integration to fetch your schedule and identify free time slots. 
                        It then matches your availability with other students working on the same assignments 
                        to suggest optimal collaboration times.
                    </p>
                    <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        maxWidth: '700px',
                        margin: '0 auto'
                    }}>
                        {[
                            'Add your assignments to the platform',
                            'Connect your Google Calendar',
                            'Specify your free time slots',
                            'Find matching times with classmates',
                            'Schedule and organize productive study sessions'
                        ].map((step, index) => (
                            <div key={index} style={{ 
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                padding: '1rem',
                                background: index % 2 === 0 ? 'rgba(66, 133, 244, 0.05)' : 'rgba(52, 168, 83, 0.05)',
                                borderRadius: '8px',
                                transition: 'transform 0.2s ease',
                            }}>
                                <div style={{
                                    background: index % 2 === 0 ? '#4285F4' : '#34A853',
                                    color: 'white',
                                    minWidth: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{
                                    fontSize: '1.1rem'
                                }}>
                                    {step}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            
            {/* CTA Section */}
            <div style={{ 
                marginTop: '4rem', 
                background: 'linear-gradient(135deg, #4285F4, #34A853)',
                padding: '2.5rem', 
                borderRadius: '12px',
                textAlign: 'center',
                color: 'white',
                boxShadow: '0 6px 18px rgba(66, 133, 244, 0.3)'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Ready to get started?</h2>
                <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>
                    Start adding your assignments and connect your calendar to find the best collaboration times.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <a href="/assignments" style={{ 
                        padding: '0.9rem 1.8rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s ease',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        Manage Assignments
                        <FaArrowRight />
                    </a>
                    <a href="/calendar" style={{ 
                        padding: '0.9rem 1.8rem',
                        backgroundColor: 'white',
                        color: '#4285F4',
                        textDecoration: 'none',
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        Setup Calendar
                        <FaCalendarAlt />
                    </a>
                </div>
            </div>
        </div>
    );
} 