import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './Pages/Dashboard';
import About from './Pages/About';
import Assignments from './Pages/Assigments';
import Calendar from './Pages/Calendar';
import Login from './Components/Login';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing user session on app load
  useEffect(() => {
    // In a real app, we would check for a valid auth token/session here
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (userEmail && userName) {
      setIsAuthenticated(true);
    } else {
      // If we have an email but no name, clear all data to ensure consistent state
      if (userEmail) {
        localStorage.removeItem('userEmail');
      }
      if (userName) {
        localStorage.removeItem('userName');
      }
      setIsAuthenticated(false);
    }
  }, []);

  // Function to toggle sidebar state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Router>
      <div className={`App ${isAuthenticated ? 'authenticated' : ''}`}>
        {isAuthenticated && <Navbar />}
        <div className="main-container">
          {isAuthenticated && <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />}
          <div className={`content ${sidebarCollapsed && isAuthenticated ? 'sidebar-collapsed' : ''}`}>
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login setAuthenticated={setIsAuthenticated} />} />
              <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
              <Route path="/about" element={isAuthenticated ? <About /> : <Navigate to="/login" />} />
              <Route path="/assignments" element={isAuthenticated ? <Assignments /> : <Navigate to="/login" />} />
              <Route path="/calendar" element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
