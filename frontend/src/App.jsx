import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Board from './pages/Board';
import './App.css';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      
      (
        <>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </>
      )
    </nav>
  );
}

function App() {
  return (
    <div>
      
        <Navbar />
        <Routes>
          <Route path="/" element={<Board />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      
    </div>
  );
}

export default App;
