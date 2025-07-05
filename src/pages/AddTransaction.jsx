import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddTransaction() {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: ''
  });

  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
const API_URL = (process.env.REACT_APP_API_URL || 'https://aws-backend-w27i.onrender.com').replace(/\/+$/, '');
  console.log(API_URL); 

  // ✅ Check if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to access this page.');
      navigate('/login');
    }
  }, [navigate]);

  // ✅ Check for edit data
  useEffect(() => {
    const existing = localStorage.getItem("editTransaction");
    if (existing) {
      const data = JSON.parse(existing);
      setForm({
        title: data.title || '',
        amount: data.amount || '',
        type: data.type || 'expense',
        category: data.category || '',
        date: data.date?.substring(0, 10) || ''
      });
      setEditId(data._id);
      localStorage.removeItem("editTransaction");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      return navigate('/login');
    }

    const url = `${API_URL}/api/transactions${editId ? `/${editId}` : ''}`;
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Error saving transaction.');
        if (res.status === 401) navigate('/login');
        return;
      }

      alert(editId ? 'Transaction updated!' : 'Transaction added!');
      navigate('/dashboard');

    } catch (err) {
      alert('Failed to connect to server.');
      console.error(err);
    }
  };

  return (
    <div className="transaction-form-container">
      <h2 style={{ textAlign: 'center' }}>{editId ? 'Edit Transaction' : 'Add Transaction'}</h2>
      <form onSubmit={handleSubmit} className="transaction-form" style={{ maxWidth: '400px', margin: 'auto' }}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />
        <button type="submit" style={{ marginTop: '10px' }}>
          {editId ? 'Update' : 'Add'}
        </button>
      </form>
    </div>
  );
}
