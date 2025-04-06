import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './Pages/Dashboard';
import About from './Pages/About';
import Assignments from './Pages/Assigments';
import Calendar from './Pages/Calendar';
import Login from './Components/Login';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';

// Create a separate component for the routed content
function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Check for existing user session on app load and after OAuth callback
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Checking authentication...");
        
        // Check if we're returning from OAuth with success
        const params = new URLSearchParams(location.search);
        if (params.get('auth') === 'success') {
          console.log("Auth success parameter detected");
          setIsAuthenticated(true);
        }

        const response = await fetch('http://127.0.0.1:5000/api/user/current', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });

        console.log("Auth response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("User data received:", data);
          setUserData(data);
          setIsAuthenticated(true);
        } else {
          console.log("Auth failed, redirecting to login");
          setIsAuthenticated(false);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location]);

  // Function to toggle sidebar state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
          <p>Please wait while we check your authentication status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <div className="main-container">
        {isAuthenticated && <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} userData={userData} />}
        <div className={`content ${sidebarCollapsed && isAuthenticated ? 'sidebar-collapsed' : ''}`}>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login setAuthenticated={setIsAuthenticated} />} />
            <Route path="/" element={isAuthenticated ? <Home userData={userData} /> : <Navigate to="/login" />} />
            <Route path="/about" element={isAuthenticated ? <About /> : <Navigate to="/login" />} />
            <Route path="/assignments" element={isAuthenticated ? <Assignments userData={userData} /> : <Navigate to="/login" />} />
            <Route path="/calendar" element={isAuthenticated ? <Calendar userData={userData} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// Main App component that provides the Router context
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
