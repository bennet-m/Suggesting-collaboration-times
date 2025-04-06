import React from 'react';
import backgroundImage from '../Assets/Images/Bookclp.png';

const SuggestedMeeting = ({ suggestedMeeting, onAdd, colorScheme }) => {
  const colors = colorScheme;
  
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: colors.main,
        borderRadius: '16px',
        padding: '24px',
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: '28%',
        backgroundPosition: '28% 50%',
        backgroundRepeat: 'no-repeat',
        marginBottom: '16px'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
      }}
    >
      {/* Overlay gradient for better text readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${colors.main} 40%, transparent 100%)`,
          opacity: 0.85,
          zIndex: 0,
          borderRadius: '16px'
        }}
      />
      
      {/* Decorative left stripe */}
      <div 
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '8px',
          height: '100%',
          backgroundColor: colors.stripe,
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: '16px',
          zIndex: 1
        }}
      />
      
      {/* Background accent elements */}
      <div 
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: colors.accent,
          opacity: '0.2',
          zIndex: 1
        }}
      />
      
      <div 
        style={{
          position: 'absolute',
          bottom: '-60px',
          right: '40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: colors.accent,
          opacity: '0.15',
          zIndex: 1
        }}
      />

      {/* Top row with Date/Assignment and Due Date/Join */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%',
        position: 'relative',
        zIndex: 2,
        marginBottom: '16px'
      }}>
        {/* Left side - Date and Assignment */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          flex: 1,
          marginRight: '20px'
        }}>
          {/* Date and Time section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: '200px',
            marginRight: '24px'
          }}>
            {/* Date and Time with calendar icon */}
            <div style={{
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(5px)',
              borderRadius: '12px',
              textAlign: 'left',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              height: '80px'
            }}>
              <div style={{
                borderLeft: `4px solid ${colors.accent}`,
                paddingLeft: '10px'
              }}>
                <p style={{ 
                  margin: '0', 
                  fontSize: '20px', 
                  fontWeight: '700',
                  letterSpacing: '-0.3px',
                  textAlign: 'left'
                }}>
                  {suggestedMeeting.date}
                </p>
                <p style={{ 
                  margin: '2px 0 0 0', 
                  fontSize: '16px', 
                  opacity: '0.9',
                  fontWeight: '500'
                }}>
                  {suggestedMeeting.time}
                </p>
              </div>
            </div>
          </div>

          {/* Assignment section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'flex-start',
            flex: 1
          }}>
            {/* Assignment label with visual indicator */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%'
            }}>
              <div style={{
                marginBottom: '8px',
                fontSize: '15px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: '0.7'
              }}>
                Assignment
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                fontSize: '1.7em',
                fontWeight: '700',
                letterSpacing: '-0.5px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(3px)',
                minHeight: '56px'
              }}>
                {suggestedMeeting.assignment}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Due Date and Join Button */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          minWidth: '160px',
          paddingLeft: '20px'
        }}>
          {/* Due date with alert icon */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '10px 16px',
            borderRadius: '24px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            marginBottom: '12px'
          }}>
            <div style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: colors.accent,
              marginRight: '8px'
            }}></div>
            <p style={{ 
              margin: 0, 
              fontWeight: 'bold', 
              fontSize: '16px' 
            }}>
              Due: {suggestedMeeting.dueDate}
            </p>
          </div>
          
          {/* Join button */}
          <button
            onClick={onAdd}
            style={{
              backgroundColor: colors.accent,
              color: '#fff',
              border: 'none',
              width: '120px',
              height: '48px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '18px',
              transition: 'all 0.3s ease',
              padding: 0,
              outline: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
            }}
          >
            Join!
          </button>
        </div>
      </div>

      {/* Bottom row - Attendees section */}
      <div style={{ 
        display: 'flex',
        width: 'calc(100% - 180px)', /* Leaves space for the right column */
        padding: '16px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        position: 'relative',
        zIndex: 2,
        backdropFilter: 'blur(3px)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '6px',
              height: '20px',
              backgroundColor: colors.accent,
              marginRight: '10px',
              borderRadius: '3px'
            }}></div>
            <p style={{ 
              margin: '0', 
              fontSize: '15px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: '0.9',
              color: colors.accent
            }}>
              Attendees
            </p>
          </div>
          <p style={{ 
            margin: '0',
            fontSize: '16px',
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            {suggestedMeeting.attendees}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuggestedMeeting;
