import React from 'react';

const SuggestedMeeting = ({ suggestedMeeting }) => {
    return (
        <div>
            <h3>Suggested Meeting</h3>
            <p>
                {suggestedMeeting.title}
            </p>
        </div>
    );
};

export default SuggestedMeeting;