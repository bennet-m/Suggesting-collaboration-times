import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Dashboard';
import About from './Pages/About';
import Assignments from './Pages/Assigments';
import Navbar from './Components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/assignments" element={<Assignments />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
