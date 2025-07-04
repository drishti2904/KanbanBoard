import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      alert('Logged in successfully!');
      navigate('/board');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h1 className="form-heading">Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="form-button">Login</button>
        </form>
        <div className="nav-links">
          <Link to="/register">Need an account? Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
