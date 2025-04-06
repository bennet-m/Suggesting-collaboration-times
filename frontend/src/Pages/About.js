import React from 'react';
import { FaBook, FaCalendarAlt, FaClock, FaUsers, FaArrowRight } from 'react-icons/fa';

export default function About() {

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
                    color: '#555'
                }}>
                    StudySync is a collaboration platform designed to help students coordinate study sessions by finding the perfect time to work together on assignments.
                </p>
                
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
                            <FaBook />
                        </span>
                        Our Mission
                    </h2>
                    <p style={{ 
                        marginBottom: '1.5rem',
                        paddingLeft: '1rem',
                        borderLeft: '3px solid #4285F4',
                    }}>
                        Our mission is to streamline the process of finding time to work on group assignments. By connecting to your Google Calendar, we automatically identify when you and your classmates are all available, making it easier than ever to schedule productive study sessions.
                    </p>
                </section>
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#4285F4', marginBottom: '1rem' }}>Our Mission</h1>
            
            <div style={{ marginTop: '2rem', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                    Here at StudySync, we empower students by making collaboration easier than ever.
                    Our algorithm analyzes user calendar data and suggests shared work times. This makes it 
                    easier than ever to study together, plan group projects, and build meaningful academic connections.
                </p>
                
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', color: '#4285F4' }}>Meet the Team</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                {[
                    { name: 'Marilyn Ma (CMC ’27)', src: '/images/placeholder.jpg' },
                    { name: 'Bennet Matazzoni (HMC ’26)', src: '/images/placeholder.jpg' },
                    { name: 'AJ Matheson-Lieber (CMC ’27)', src: '/images/placeholder.jpg' },
                    { name: 'Nico Riley (CMC ’27)', src: '/images/placeholder.jpg' }
                ].map((member, i) => (
                    <div key={i} style={{ textAlign: 'center', maxWidth: '150px' }}>
                        <img 
                            src={member.src} 
                            alt={member.name} 
                            style={{ 
                                width: '100%', 
                                height: 'auto', 
                                borderRadius: '8px', 
                                marginBottom: '0.5rem' 
                            }} 
                        />
                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{member.name}</p>
                    </div>
                ))}
            </div>
                
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
                    <ul style={{ 
                        listStyleType: 'none', 
                        marginLeft: '0.5rem', 
                        marginBottom: '1.5rem'
                    }}>
                        <li style={{ 
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                color: '#34A853',
                                fontSize: '1.2rem'
                            }}><FaBook /></div>
                            Track assignments and due dates
                        </li>
                        <li style={{ 
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                color: '#34A853',
                                fontSize: '1.2rem'
                            }}><FaCalendarAlt /></div>
                            Connect with Google Calendar for availability
                        </li>
                        <li style={{ 
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                color: '#34A853',
                                fontSize: '1.2rem'
                            }}><FaClock /></div>
                            Find matching free time slots with classmates
                        </li>
                        <li style={{ 
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                color: '#34A853',
                                fontSize: '1.2rem'
                            }}><FaUsers /></div>
                            Organize study sessions around shared assignments
                        </li>
                    </ul>
                </section>
                
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
                    <p style={{ marginBottom: '1.5rem' }}>
                        StudySync uses Google Calendar integration to fetch your schedule and identify free time slots. It then matches your availability with other students working on the same assignments to suggest optimal collaboration times.
                    </p>
                    <ol style={{ 
                        marginLeft: '0', 
                        marginBottom: '1.5rem',
                        counterReset: 'step-counter',
                        listStyleType: 'none'
                    }}>
                        {[
                            'Add your assignments to the platform',
                            'Connect your Google Calendar',
                            'Specify your free time slots',
                            'Find matching times with classmates',
                            'Schedule and organize productive study sessions'
                        ].map((step, index) => (
                            <li key={index} style={{ 
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                counterIncrement: 'step-counter'
                            }}>
                                <div style={{
                                    background: '#4285F4',
                                    color: 'white',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {index + 1}
                                </div>
                                {step}
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
            
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