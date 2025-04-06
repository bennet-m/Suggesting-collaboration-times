import React, { useState } from 'react';

const CreateStudyGroupModal = ({ isOpen, onClose, onCreateGroup, colorScheme }) => {
  const [groupName, setGroupName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [members, setMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState({});
  
  const colors = colorScheme || {
    main: '#4355BE', // Deep Blue
    accent: '#6D5BF8', // Purple Blue
    text: '#ffffff', // White
    stripe: 'rgba(109, 91, 248, 0.8)' // Brighter accent for stripe
  };
  
  // Return early if modal should not be shown
  if (!isOpen) return null;
  
  // Function to add a member 
  const handleAddMember = () => {
    if (!memberEmail.trim() || !memberEmail.includes('@')) {
      setErrors(prev => ({ ...prev, memberEmail: 'Please enter a valid email' }));
      return;
    }
    
    setErrors(prev => ({ ...prev, memberEmail: null }));
    const memberName = memberEmail.split('@')[0].replace(/[.]/g, ' ');
    // Capitalize first letter of each word
    const formattedName = memberName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    setMembers([...members, { name: formattedName, email: memberEmail }]);
    setMemberEmail('');
  };
  
  // Function to remove a member
  const handleRemoveMember = (index) => {
    const updatedMembers = [...members];
    updatedMembers.splice(index, 1);
    setMembers(updatedMembers);
  };
  
  // Function to create the group
  const handleCreateGroup = () => {
    // Validate form
    const newErrors = {};
    
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    }
    
    if (!classCode.trim()) {
      newErrors.classCode = 'Class code is required';
    }
    
    if (members.length === 0) {
      newErrors.members = 'At least one member is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create the group
    const newGroup = {
      id: `group-${Date.now()}`,
      name: `${classCode} ${groupName}`,
      members: ['You', ...members.map(m => m.name)],
      meetingDate,
      meetingTime,
      location
    };
    
    onCreateGroup(newGroup);
    onClose();
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
        {/* Header */}
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
            Create New Study Group
          </h2>
        </div>
        
        {/* Form content */}
        <div style={{ 
          padding: '24px',
          overflow: 'auto',
          flex: '1'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="groupName" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '16px',
                color: '#333' 
              }}
            >
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Study Group Name"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: errors.groupName ? '1px solid #e74c3c' : '1px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
            {errors.groupName && (
              <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '4px' }}>
                {errors.groupName}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="classCode" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '16px',
                color: '#333' 
              }}
            >
              Class Code (e.g. CS101, MATH241)
            </label>
            <input
              id="classCode"
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Class Code"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: errors.classCode ? '1px solid #e74c3c' : '1px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
            {errors.classCode && (
              <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '4px' }}>
                {errors.classCode}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '16px',
                color: '#333' 
              }}
            >
              Members
            </label>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '12px' 
            }}>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Member Email"
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  border: errors.memberEmail ? '1px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '8px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddMember();
                  }
                }}
              />
              <button
                onClick={handleAddMember}
                style={{
                  padding: '12px 16px',
                  backgroundColor: colors.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            
            {errors.memberEmail && (
              <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '12px' }}>
                {errors.memberEmail}
              </div>
            )}
            
            {errors.members && (
              <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '12px' }}>
                {errors.members}
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div 
                style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
              >
                You (Group Creator)
              </div>
              
              {members.map((member, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>{member.name}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{member.email}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(index)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label 
                htmlFor="meetingDate" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  fontSize: '16px',
                  color: '#333' 
                }}
              >
                Meeting Date (Optional)
              </label>
              <input
                id="meetingDate"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label 
                htmlFor="meetingTime" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  fontSize: '16px',
                  color: '#333' 
                }}
              >
                Meeting Time (Optional)
              </label>
              <input
                id="meetingTime"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="location" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '16px',
                color: '#333' 
              }}
            >
              Location (Optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Study Room, Online, etc."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
        
        {/* Footer with actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              backgroundColor: '#f8f9fa',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleCreateGroup}
            style={{
              padding: '12px 20px',
              backgroundColor: colors.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStudyGroupModal; 