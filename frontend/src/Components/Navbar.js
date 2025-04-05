import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ 
      backgroundColor: '#4285F4', 
      padding: '1rem', 
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <div className="logo">
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
          StudySync
        </Link>
      </div>
      <ul style={{ 
        display: 'flex', 
        listStyle: 'none', 
        margin: 0,
        gap: '2rem'
      }}>
        <li>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        </li>
        <li>
          <Link to="/assignments" style={{ color: 'white', textDecoration: 'none' }}>Assignments</Link>
        </li>
        <li>
          <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar; 