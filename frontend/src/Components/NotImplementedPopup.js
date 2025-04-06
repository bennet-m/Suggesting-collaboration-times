import React from 'react';
import './NotImplementedPopup.css';

function NotImplementedPopup({ isOpen, onClose, featureName }) {
    if (!isOpen) return null;

    return (
        <div className="not-implemented-overlay" onClick={onClose}>
            <div className="not-implemented-popup" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h3>Feature Not Available</h3>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="popup-content">
                    <div className="popup-icon">
                        <i className="fas fa-tools"></i>
                    </div>
                    <p>
                        <strong>{featureName || "This feature"}</strong> is not yet implemented.
                    </p>
                    <p>We're working on it and it will be available soon!</p>
                    <div className="popup-actions">
                        <button className="ok-button" onClick={onClose}>
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotImplementedPopup; 