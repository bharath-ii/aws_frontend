import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const API_URL = (process.env.REACT_APP_API_URL || 'https://aws-backend-w27i.onrender.com').replace(/\/+$/, '');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const res = await fetch(`${API_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        alert("Error fetching transactions.");
      }
    };

    fetchData();
  }, [API_URL, navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setTransactions(transactions.filter(t => t._id !== id));
  };

  const handleEdit = (transaction) => {
    localStorage.setItem('editTransaction', JSON.stringify(transaction));
    navigate('/add');
  };

  return (
    <div style={{ padding: '30px', textAlign: 'center' }}>
      <h2>All Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{
            margin: '0 auto',
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
            width: '90%',
            border: '1px solid grey'
          }}>
            <thead style={{ backgroundColor: '#f3f3f3' }}>
              <tr>
                <th style={cellStyle}>Title</th>
                <th style={cellStyle}>Amount</th>
                <th style={cellStyle}>Type</th>
                <th style={cellStyle}>Date</th>
                <th style={cellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id} style={{ background: '#fff' }}>
                  <td style={cellStyle}>{t.title}</td>
                  <td style={cellStyle}>₹{t.amount}</td>
                  <td style={{ ...cellStyle, color: t.type === 'income' ? 'green' : 'red' }}>{t.type}</td>
                  <td style={cellStyle}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={cellStyle}>
                    <button onClick={() => handleEdit(t)} style={{ marginRight: '10px' }}><FaEdit /></button>
                    <button onClick={() => handleDelete(t._id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const cellStyle = {
  padding: '10px',
  border: '1px solid lightgray',
  textAlign: 'center'
};

export default Transactions;
