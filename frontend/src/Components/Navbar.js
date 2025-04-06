import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Get current scroll position
      const currentScrollPos = window.pageYOffset;
      
      // Set navbar visibility based on scroll direction
      setVisible(
        // Make the navbar visible if user scrolls up or is at the top of the page
        // Hide it if user scrolls down and is not at the top
        prevScrollPos > currentScrollPos || currentScrollPos < 10
      );
      
      // Update previous scroll position
      setPrevScrollPos(currentScrollPos);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <nav className={`navbar ${visible ? '' : 'hidden'}`}>
      <div className="logo">
        <Link to="/">
          StudySync
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar; 