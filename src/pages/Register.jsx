import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://budget-tracker.duckdns.org:5000';

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.message === 'User registered') {
        alert("Registered successfully! Please log in.");
        navigate('/');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="register-container" style={containerStyle}>
      <h2>Register</h2>
      <form onSubmit={handleRegister} style={formStyle}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          style={inputStyle}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Register</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account?{' '}
        <Link to="/" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Login
        </Link>
      </p>
    </div>
  );
}

// 🎨 Inline styles
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
  backgroundColor: '#28a745',
  color: '#fff',
  fontSize: '16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
