import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '');



  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Server unreachable. Please try again later.');
      console.error(error);
    }
  };

  return (
    <div className="login-container" style={containerStyle}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={formStyle}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={inputStyle}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don&apos;t have an account?{' '}
        <Link to="/register" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Register
        </Link>
      </p>
    </div>
  );
}

// 🎨 Optional basic styling
const containerStyle = {
  maxWidth: '400px',
  margin: '40px auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  background: '#f9f9f9'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const inputStyle = {
  padding: '10px',
  fontSize: '16px',
  border: '1px solid #ccc',
  borderRadius: '4px'
};

const buttonStyle = {
  padding: '10px',
  backgroundColor: '#008000',
  color: '#fff',
  fontSize: '16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
