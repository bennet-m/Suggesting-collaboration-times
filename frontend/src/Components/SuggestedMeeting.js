import React from 'react';

const SuggestedMeeting = ({ suggestedMeeting, onAdd, bgColor }) => {
  return (
    <div
      style={{
        width: '100%',                     // Stretches across the screen
        backgroundColor: bgColor,          // Blue background
        borderRadius: '12px',                // Rounded edges
        padding: '16px',
        color: '#fff',
        display: 'flex',                     // Two-column layout using Flexbox
        justifyContent: 'space-between',     
        alignItems: 'flex-start',
        boxSizing: 'border-box'
      }}
    >
    {/* Left Column: Assignment Title */}
    <div style={{ display: 'flex', flexDirection: 'column' }}>
    <h2 style={{ margin: 0, fontSize: '35px'}}>{suggestedMeeting.title}</h2>

        {/* Date and Time on the same row */}
        <div style = {{display: 'flex', gap: '50px', marginTop: '8px'}}>
            <p style={{ margin: '0', fontSize: '20px' }}>{suggestedMeeting.date}</p>
            <p style={{ margin: '0', marginLeft: '10px', fontSize: '20px' }}>{suggestedMeeting.time}</p>
        </div>

    </div>

      {/* Right Column: Due date and Add button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Due: {suggestedMeeting.dueDate}</p>
        <button
          onClick={onAdd}  // Callback function for button click
          style={{
            marginTop: '8px',
            backgroundColor: '#fff',       // White button background
            color: '#4285F4',              // Blue text to match the theme
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SuggestedMeeting;
