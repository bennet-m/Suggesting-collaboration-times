import React, { useState } from 'react';

const StudyGroupModal = ({ isOpen, onClose, group, colorScheme }) => {
  const [showFriendStatus, setShowFriendStatus] = useState(true);
  
  // For demo purposes, we'll consider some members as friends
  const friends = ['Nico', 'AJ', 'Bennet', 'Alice', 'Eli']; 
  
  const colors = colorScheme || {
    main: '#4355BE', // Deep Blue
    accent: '#6D5BF8', // Purple Blue
    text: '#ffffff', // White
    stripe: 'rgba(109, 91, 248, 0.8)' // Brighter accent for stripe
  };
  
  // Return early if modal should not be shown
  if (!isOpen || !group) return null;
  
  // Basic Google Calendar icon SVG
  const CalendarIcon = () => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: '8px' }}
    >
      <path 
        d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16 2V6" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M8 2V6" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M3 10H21" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
  
  // Email Icon
  const EmailIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: '8px' }}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 7L12 14L22 7" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
  
  // Friend Icon
  const FriendIcon = ({ isFriend }) => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: '8px', color: isFriend ? '#47D185' : '#ccc' }}
    >
      <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="currentColor" strokeWidth="2"/>
      {isFriend && <path d="M8.5 8.5L15.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
    </svg>
  );
  
  // Function to create a Google Calendar event
  const handleCreateEvent = () => {
    const title = encodeURIComponent(`${group.name} Meeting`);
    const description = encodeURIComponent(`Meeting for ${group.name}`);
    
    // Create current date + 1 day at 3PM for demo purposes
    const now = new Date();
    const meetingDate = new Date(now);
    meetingDate.setDate(meetingDate.getDate() + 1);
    meetingDate.setHours(15, 0, 0, 0);
    
    const endDate = new Date(meetingDate);
    endDate.setHours(16, 0, 0, 0);
    
    // Format dates for Google Calendar (YYYYMMDDTHHMMSS format)
    const formatDateForGCal = (date) => {
      const pad = (num) => (num < 10 ? '0' + num : num);
      
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      
      return `${year}${month}${day}T${hours}${minutes}00`;
    };
    
    const startDateFormatted = formatDateForGCal(meetingDate);
    const endDateFormatted = formatDateForGCal(endDate);
    
    // Create Google Calendar URL
    let googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateFormatted}/${endDateFormatted}&details=${description}`;
    
    // Open the Google Calendar link in a new tab
    window.open(googleCalendarUrl, '_blank');
  };
  
  // Function to send group email
  const handleGroupEmail = () => {
    // Mocked emails for demo purposes
    const memberEmails = group.members.map(name => {
      return `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    });
    
    // Create mailto URL with all recipients
    const mailtoUrl = `mailto:?bcc=${memberEmails.join(',')}`;
    window.open(mailtoUrl, '_blank');
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(3px)'
      }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          width: '90%',
          maxWidth: '550px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'fadeScale 0.3s ease forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with color from the study group */}
        <div 
          style={{
            backgroundColor: colors.main,
            color: colors.text,
            padding: '24px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Decorative left stripe */}
          <div 
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '8px',
              height: '100%',
              backgroundColor: colors.stripe,
              zIndex: 1
            }}
          />
          
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#fff',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              zIndex: 2,
              transition: 'all 0.2s ease'
            }}
          >
            ✕
          </button>
          
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
            {group.name}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.25)', 
              borderRadius: '50%', 
              width: '32px', 
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="white" strokeWidth="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="white" strokeWidth="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span style={{ fontWeight: '500' }}>{group.members.length} Members</span>
          </div>
        </div>
        
        {/* Actions */}
        <div style={{ 
          padding: '16px 24px',
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid #eee'
        }}>
          <button
            onClick={handleCreateEvent}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.accent,
              color: '#fff',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <CalendarIcon />
            Schedule Meeting
          </button>
          
          <button
            onClick={handleGroupEmail}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              color: '#333',
              border: '1px solid #ddd',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <EmailIcon />
            Email Group
          </button>
        </div>
        
        {/* Members list */}
        <div style={{ 
          padding: '24px',
          overflow: 'auto',
          flex: '1'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ 
              margin: '0', 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Group Members
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <label style={{
                display: 'flex', 
                alignItems: 'center',
                fontSize: '14px',
                color: '#555',
                userSelect: 'none',
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox"
                  checked={showFriendStatus}
                  onChange={() => setShowFriendStatus(!showFriendStatus)}
                  style={{ marginRight: '6px' }}
                />
                Show friend status
              </label>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {group.members.map((member, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: colors.main,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    {member.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin: '0', fontWeight: '600', fontSize: '16px' }}>{member}</p>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      {member.toLowerCase().replace(/\s+/g, '.')}@example.com
                    </p>
                  </div>
                </div>
                
                {showFriendStatus && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    backgroundColor: friends.includes(member) ? 'rgba(71, 209, 133, 0.1)' : 'transparent',
                    padding: '4px 10px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: friends.includes(member) ? '#47D185' : '#999',
                    cursor: 'pointer'
                  }}>
                    <FriendIcon isFriend={friends.includes(member)} />
                    {friends.includes(member) ? 'Friend' : 'Add Friend'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupModal; 