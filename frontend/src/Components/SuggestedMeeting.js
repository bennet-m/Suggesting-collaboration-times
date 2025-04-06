import React, { useState } from 'react';
import backgroundImage from '../Assets/Images/Bookclp.png';



const SuggestedMeeting = ({ suggestedMeeting, onAdd, colorScheme, isUpcoming }) => {
  const colors = colorScheme;
  const [showTooltip, setShowTooltip] = useState(false);
  const DEFAULT_MEETING_DURATION = 1; // 1 default meeting time
  
  // Basic Google Calendar icon SVG (Thank you Claude)
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
  
  // Check Icon SVG for upcoming meetings
  const CheckIcon = () => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: '8px' }}
    >
      <path 
        d="M20 6L9 17L4 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
  
  const handleJoinClick = (e) => {
    e.preventDefault();
    
    // Prevent button event from bubbling to parent elements
    e.stopPropagation();
    
    // Create Google Calendar URL with event details
    const title = encodeURIComponent(suggestedMeeting.assignment || 'Meeting');
    const description = encodeURIComponent(`Suggested meeting for ${suggestedMeeting.assignment || 'assignment'}`);
    
    // Handle attendees - extract emails from format "Name <email@example.com>"
    let attendeesParam = '';
    if (suggestedMeeting.attendees) {
      // Extract email addresses from the format "Name <email@example.com>"
      const emailRegex = /<([^>]+)>/g;
      const emails = [];
      let match;
      const attendeesStr = suggestedMeeting.attendees;
      
      // Use regex to extract all email addresses
      while ((match = emailRegex.exec(attendeesStr)) !== null) {
        if (match[1] && match[1].includes('@')) {
          emails.push(match[1]);
        }
      }
      
      // Fallback to split by comma if no email format is found
      if (emails.length === 0) {
        const attendees = attendeesStr.split(',').map(item => item.trim());
        attendeesParam = attendees.map(email => `&add=${encodeURIComponent(email)}`).join('');
      } else {
        attendeesParam = emails.map(email => `&add=${encodeURIComponent(email)}`).join('');
      }
      
    }
    
    try {
      
      // Calculate default time (now + 1 hour for duration)
      const now = new Date();
      const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      
      // Create a fallback URL that will always work
      const createFallbackUrl = () => {
        // Format for now and one hour later, which will always work
        const formatDate = (date) => {
          return date.toISOString().replace(/-|:|\.\d+/g, '');
        };
        
        const startTime = formatDate(now).slice(0, 15);
        const endTime = formatDate(defaultEnd).slice(0, 15);
        
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${description}${attendeesParam}`;
      };
      
      // Try to parse the provided date and time
      // Get current date if date parsing fails lol
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + DEFAULT_MEETING_DURATION);
      
      // Create default start and end dates
      let startDate = new Date(now);
      let endDate = new Date(defaultEnd);
      let usedFallbackDates = true; // Start with fallback dates
      let startTimeParsed = false;  // Track if start time was parsed successfully
      let endTimeParsed = false;    // Track if end time was parsed successfully
      
      // Try to parse the meeting date/time
      const dateStr = suggestedMeeting.date;
      const timeRange = suggestedMeeting.time;
      
      if (dateStr && timeRange) {
        try {

          // Clean the date string - remove any ordinal suffixes if present (1st, 2nd, 3rd, etc.)
          const cleanDateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
          
          // Clean dates a bit more
          const veryCleanDateStr = cleanDateStr
            .replace(/\s+/g, ' ')           // normalize spaces
            .trim();
          
          
          // Try multiple date parsing approaches
          let parsedDate;
          
          // Approach 1: Direct parsing
          parsedDate = new Date(veryCleanDateStr);
          
          // If we got a valid date, check if year needs fixing
          if (!isNaN(parsedDate.getTime())) {
            const currentYear = new Date().getFullYear();
            if (parsedDate.getFullYear() < currentYear - 10 || parsedDate.getFullYear() > currentYear + 10) {
              parsedDate.setFullYear(currentYear);
            }
          }
          
          // Approach 2: If date looks like "May 15, 2023" or similar format
          if (isNaN(parsedDate.getTime()) && /[A-Za-z]+\s+\d+,\s+\d{4}/.test(cleanDateStr)) {
            // Try to force US date format interpretation
            const parts = cleanDateStr.match(/([A-Za-z]+)\s+(\d+),\s+(\d{4})/);
            if (parts) {
              const [/* full match */, month, day, year] = parts;
              const monthNames = {"January":0, "February":1, "March":2, "April":3, "May":4, "June":5, 
                                  "July":6, "August":7, "September":8, "October":9, "November":10, "December":11};
              const monthIndex = monthNames[month] || 0;
              parsedDate = new Date(parseInt(year), monthIndex, parseInt(day));
            }
          }
          
          // Approach 3: Common date formats
          if (isNaN(parsedDate.getTime())) {
            // Try various patterns
            const datePatterns = [
              // Month name formats
              { 
                regex: /([A-Za-z]+)\s+(\d+),?\s+(\d{4})/i,  // "May 15, 2023" or "May 15 2023"
                parser: (match) => {
                  const [/* full match */, month, day, year] = match;
                  const monthNames = {
                    "january": 0, "february": 1, "march": 2, "april": 3, "may": 4, "june": 5, 
                    "july": 6, "august": 7, "september": 8, "october": 9, "november": 10, "december": 11
                  };
                  const monthIndex = monthNames[month.toLowerCase()] || 0;
                  return new Date(parseInt(year), monthIndex, parseInt(day));
                }
              },
              // Numeric formats
              {
                regex: /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/,  // "5/15/2023" or "15-5-2023" or "5.15.2023"
                parser: (match) => {
                  const [/* full match */, part1, part2, year] = match;
                  
                  // Determine if MM/DD or DD/MM based on values
                  let month, day;
                  
                  // If first part > 12, assume it's a day (European format)
                  if (parseInt(part1) > 12) {
                    day = parseInt(part1);
                    month = parseInt(part2) - 1;  // months are 0-indexed
                  } else {
                    // Otherwise, assume American format MM/DD
                    month = parseInt(part1) - 1;
                    day = parseInt(part2);
                  }
                  
                  return new Date(parseInt(year), month, day);
                }
              },
              // ISO-like format
              {
                regex: /(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/,  // "2023-5-15" or "2023/05/15"
                parser: (match) => {
                  const [/* full match */, year, month, day] = match;
                  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                }
              }
            ];
            
            // Try each pattern
            for (const { regex, parser } of datePatterns) {
              const match = veryCleanDateStr.match(regex);
              if (match) {
                try {
                  const result = parser(match);
                  if (!isNaN(result.getTime())) {
                    // Fix year if it's far in the past or future
                    const currentYear = new Date().getFullYear();
                    if (result.getFullYear() < currentYear - 10 || result.getFullYear() > currentYear + 10) {
                      result.setFullYear(currentYear);
                    }
                    
                    parsedDate = result;
                    break;
                  }
                } catch (err) {
                  console.warn('Error using date pattern:', err);
                }
              }
            }
          }
          
          // Check if we got a valid date
          if (!isNaN(parsedDate.getTime())) {
            // Important: Set this AFTER we confirm we have a valid date
            usedFallbackDates = false; // We have a real date now
            
            // Fix year if it's far in the past or future (likely wrong year parsing)
            const currentYear = new Date().getFullYear();
            if (parsedDate.getFullYear() < currentYear - 10 || parsedDate.getFullYear() > currentYear + 10) {
              console.log('Detected incorrect year:', parsedDate.getFullYear(), 'fixing to current year:', currentYear);
              parsedDate.setFullYear(currentYear);
            }
            
            // Process time ranges like "2:00 PM - 3:00 PM" or single times like "2:00 PM"
            const timeParts = timeRange.split(' - ');
            const startTimeStr = timeParts[0].trim();
            const endTimeStr = timeParts.length > 1 ? timeParts[1].trim() : '';
            
            
            // Try multiple time regex patterns
            const timePatterns = [
              /(\d+):(\d+)\s*(am|pm|AM|PM)?/,    // 2:00 PM
              /(\d+)\s*(am|pm|AM|PM)?/,          // 2 PM
              /(\d+)([:.])(\d+)([ap]m)/i,        // 2.30pm or 2:30pm (no space)
              /(\d+)([ap]m)/i                    // 2pm (no space)
            ];
            
            // Parse time helper function to standardize time parsing
            const parseTimeString = (timeStr, pattern, match) => {
              let hours, minutes, ampm;
              
              if (pattern === timePatterns[0]) {
                // Format: "2:00 PM"
                hours = parseInt(match[1], 10);
                minutes = parseInt(match[2], 10);
                ampm = match[3] ? match[3].toLowerCase() : null;
              } 
              else if (pattern === timePatterns[1]) {
                // Format: "2 PM"
                hours = parseInt(match[1], 10);
                minutes = 0;
                ampm = match[2] ? match[2].toLowerCase() : null;
              }
              else if (pattern === timePatterns[2]) {
                // Format: "2.30pm" or "2:30pm" (no space)
                hours = parseInt(match[1], 10);
                minutes = parseInt(match[3], 10);
                ampm = match[4].toLowerCase();
              }
              else if (pattern === timePatterns[3]) {
                // Format: "2pm" (no space)
                hours = parseInt(match[1], 10);
                minutes = 0;
                ampm = match[2].toLowerCase();
              }
              
              // Normalize AM/PM
              if (ampm) {
                ampm = ampm.toLowerCase();
                if (ampm.includes('p')) ampm = 'pm';
                if (ampm.includes('a')) ampm = 'am';
              }
              
              return { hours, minutes, ampm };
            };
            
            // Parse start time
            if (startTimeStr) {
              for (const pattern of timePatterns) {
                const startMatch = startTimeStr.match(pattern);
                if (startMatch) {
                  
                  const { hours, minutes, ampm } = parseTimeString(startTimeStr, pattern, startMatch);
                  console.log('Parsed start time:', { hours, minutes, ampm });
                  
                  // Only proceed if we have valid hours
                  if (typeof hours === 'number' && !isNaN(hours)) {
                    let adjustedHours = hours;
                    
                    // Adjust hours for AM/PM
                    if (ampm === 'pm' && hours < 12) {
                      adjustedHours += 12;
                    } else if (ampm === 'am' && hours === 12) {
                      adjustedHours = 0;
                    }
                    
                    startDate = new Date(parsedDate);
                    startDate.setHours(adjustedHours, minutes || 0, 0, 0);
                    console.log('Start date set to:', startDate);
                    startTimeParsed = true;
                    break;
                  }
                }
              }
            }
            
            // Parse end time
            if (endTimeStr) {
              for (const pattern of timePatterns) {
                const endMatch = endTimeStr.match(pattern);
                if (endMatch) {
                  console.log('End time match with pattern:', pattern, endMatch);
                  
                  const { hours, minutes, ampm } = parseTimeString(endTimeStr, pattern, endMatch);
                  console.log('Parsed end time:', { hours, minutes, ampm });
                  
                  // Only proceed if we have valid hours
                  if (typeof hours === 'number' && !isNaN(hours)) {
                    let adjustedHours = hours;
                    
                    // Adjust hours for AM/PM
                    if (ampm === 'pm' && hours < 12) {
                      adjustedHours += 12;
                    } else if (ampm === 'am' && hours === 12) {
                      adjustedHours = 0;
                    }
                    
                    endDate = new Date(parsedDate);
                    endDate.setHours(adjustedHours, minutes || 0, 0, 0);
                    console.log('End date set to:', endDate);
                    endTimeParsed = true;
                    break;
                  }
                }
              }
            }
            
            // If end time wasn't parsed but start time was
            if (!endTimeParsed && startTimeParsed) {
              // If no end time is provided, set meeting duration to 1 hour
              endDate = new Date(startDate);
              endDate.setHours(endDate.getHours() + DEFAULT_MEETING_DURATION);
              console.log('End date set to start + 1hr:', endDate);
              endTimeParsed = true;  // We've set a valid end time
            }
            
            // If end time is before start time, assume it's the next day
            if (endDate < startDate) {
              endDate.setDate(endDate.getDate() + 1);
              console.log('End date adjusted to next day:', endDate);
            }
          } else {
            console.warn('Invalid date format, using current date');
            usedFallbackDates = true; // Ensure we're using fallback
          }
        } catch (dateError) {
          console.warn('Error parsing date/time:', dateError);
          usedFallbackDates = true; // Ensure we're using fallback
        }
      } else {
        console.warn('Missing date or time, using current date/time');
        usedFallbackDates = true; // Ensure we're using fallback
      }
      
      // Final check: If time parsing failed, use default dates
      if (!startTimeParsed && !endTimeParsed) {
        console.warn('Time parsing failed completely, using current time');
        usedFallbackDates = true;
      }
      
      // Format dates for Google Calendar (YYYYMMDDTHHMMSS format without timezone)
      const formatDateForGCal = (date) => {
        const pad = (num) => (num < 10 ? '0' + num : num);
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        
        return `${year}${month}${day}T${hours}${minutes}00`;
      };
      
      let startDateFormatted, endDateFormatted;
      
      // Check if our date parsing worked
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || usedFallbackDates) {
        // Use fallback URL if date parsing failed or we used fallback dates
        const fallbackUrl = createFallbackUrl();
        console.log('Using fallback URL (invalid dates or fallback used):', fallbackUrl);
        window.open(fallbackUrl, '_blank');
        return;
      }
      
      // Success - we have valid parsed dates!
      console.log('Final parsed start date:', startDate);
      console.log('Final parsed end date:', endDate);
      
      // Final year check before formatting
      const currentYear = new Date().getFullYear();
      if (startDate.getFullYear() < currentYear - 10 || startDate.getFullYear() > currentYear + 10) {
        console.log('Final check: Fixing start date year from', startDate.getFullYear(), 'to', currentYear);
        startDate.setFullYear(currentYear);
      }
      if (endDate.getFullYear() < currentYear - 10 || endDate.getFullYear() > currentYear + 10) {
        console.log('Final check: Fixing end date year from', endDate.getFullYear(), 'to', currentYear);
        endDate.setFullYear(currentYear);
      }
      
      startDateFormatted = formatDateForGCal(startDate);
      endDateFormatted = formatDateForGCal(endDate);
      
      console.log('Formatted dates for GCal:', startDateFormatted, endDateFormatted);
      
      // Create Google Calendar URL with properly formatted dates
      let googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateFormatted}/${endDateFormatted}&details=${description}${attendeesParam}`;
      
      // Add location if available
      if (suggestedMeeting.location) {
        googleCalendarUrl += `&location=${encodeURIComponent(suggestedMeeting.location)}`;
      }
      
      console.log('Calendar URL:', googleCalendarUrl);
      
      // Open the Google Calendar link in a new tab
      window.open(googleCalendarUrl, '_blank');
      
    } catch (error) {
      console.error("Error creating Google Calendar link:", error);
      // If any error occurs, use a minimal fallback URL
      const minimalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}`;
      console.log('Using minimal fallback URL due to error:', minimalUrl);
      window.open(minimalUrl, '_blank');
    }
    
    // Call the original onAdd function if it exists
    if (onAdd) {
      onAdd();
    }
  };
  
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
      
      {/* Top section with headers - Date, Assignment, and Due Date */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%',
        height: '30px',
        position: 'relative',
        zIndex: 2,
        marginBottom: '8px'
      }}>
        {/* Date header */}
        <div style={{
          marginBottom: '0',
          fontSize: '15px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: '0.7',
          textAlign: 'left',
          minWidth: '180px',
          marginRight: '24px',
          alignSelf: 'flex-end'
        }}>
          Date
        </div>
        
        {/* Assignment header */}
        <div style={{
          marginBottom: '0',
          fontSize: '15px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: '0.7',
          flex: 1,
          textAlign: 'left',
          alignSelf: 'flex-end'
        }}>
          Assignment
        </div>
        
        {/* Due date section */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          padding: '7.5px 16px',
          borderRadius: '24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          height: '24px',
          flexShrink: 0,
          marginLeft: '15px'
        }}>
          <div style={{
            display: 'inline-block',
            width: '10px',
            height: '8px',
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
      </div>
      
      {/* Main content row with Date and Assignment */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%',
        position: 'relative',
        zIndex: 2,
        marginBottom: '16px'
      }}>
        {/* Date and Time section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: '180px',
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
            height: '56px'
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

        {/* Assignment content */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'flex-start',
          flex: 1,
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '56px',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '2em',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(3px)',
            boxSizing: 'border-box'
          }}>
            {suggestedMeeting.assignment}
          </div>
        </div>
      </div>

      {/* Bottom row - Attendees section */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%', 
        padding: '16px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        position: 'relative',
        zIndex: 2,
        backdropFilter: 'blur(3px)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          gap: '10px',
          alignItems: 'center',
          marginRight: '15px',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            flexShrink: 0
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
            lineHeight: '1.5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {/* Display only names (not emails) in the UI */}
            {suggestedMeeting.attendees
              .split(',')
              .map(attendee => attendee.trim().split('<')[0].trim())
              .join(', ')}
          </p>
        </div>
        {/* Join button with tooltip */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {!isUpcoming ? <button
            onClick={handleJoinClick}
            style={{
              backgroundColor: colors.accent,
              color: '#fff',
              border: 'none',
              width: '140px',
              height: '48px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '18px',
              transition: 'all 0.3s ease',
              padding: '0 12px',
              outline: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
              transform: 'scale(1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25)';
              setShowTooltip(true);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
              setShowTooltip(false);
            }}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {isUpcoming ? <CheckIcon /> : <CalendarIcon />}
              <span>Join!</span>
            </span>
          </button> : <div></div>}
          
          {/* Tooltip */}
          {showTooltip && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              {isUpcoming ? 'Open in Google Calendar' : 'Add to Google Calendar'}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(0, 0, 0, 0.75)'
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestedMeeting;
