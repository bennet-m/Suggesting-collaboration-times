import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Home from './Pages/Dashboard';
import About from './Pages/About';
import Assignments from './Pages/Assigments';
import Calendar from './Pages/Calendar';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to toggle sidebar state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="main-container">
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          <div className={`content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/calendar" element={<Calendar />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
