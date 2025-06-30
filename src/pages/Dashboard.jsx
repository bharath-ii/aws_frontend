
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { FaMoneyBillWave, FaArrowDown, FaBalanceScale, FaEdit, FaTrash } from 'react-icons/fa';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'https://budget-tracker.duckdns.org:5000';

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const res = await fetch(`${API_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401) {
          alert("Unauthorized. Please login again.");
          localStorage.removeItem('token');
          navigate('/');
          return;
        }

        const data = await res.json();
        setTransactions(data || []);
      } catch (err) {
        console.error("Fetch failed", err);
        alert("Server error. Please try again.");
      }
    };

    fetchData();
  }, [API_URL, navigate]);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  const COLORS = ['#ff6384', '#36a2eb', '#ffce56', '#8bc34a', '#e91e63', '#9c27b0'];

  const categoryData = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!categoryData[t.category]) categoryData[t.category] = 0;
      categoryData[t.category] += t.amount;
    });

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const lineData = transactions
    .filter(t => t.type === 'expense')
    .map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      amount: t.amount
    }));

  const barData = pieData;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setTransactions(prev => prev.filter(t => t._id !== id));
  };

  const handleEdit = (transaction) => {
    localStorage.setItem("editTransaction", JSON.stringify(transaction));
    navigate('/add');
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {/* Summary */}
      <div className="summary-cards" style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', marginBottom: '20px' }}>
        <div className="box green">
          <FaMoneyBillWave size={24} />
          <div><strong>Income:</strong> ₹{income}</div>
        </div>
        <div className="box red">
          <FaArrowDown size={24} />
          <div><strong>Expense:</strong> ₹{expense}</div>
        </div>
        <div className="box blue">
          <FaBalanceScale size={24} />
          <div><strong>Balance:</strong> ₹{balance}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/add')}>+ Add Transaction</button>
      </div>

      {transactions.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'gray', fontStyle: 'italic' }}>
          No transactions yet. Add one to see insights!
        </p>
      ) : (
        <>
          {/* Pie Chart */}
          {pieData.length > 0 && (
            <>
              <h3>Expense Distribution (Pie)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}

          {/* Line Chart */}
          {lineData.length > 0 && (
            <>
              <h3>Spending Over Time (Line)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}

          {/* Bar Chart */}
          {barData.length > 0 && (
            <>
              <h3>Category-wise Expenses (Bar)</h3>
             <ResponsiveContainer width="100%" height={300}>
  <BarChart 
    data={barData}
    barSize={25}               // 👈 Width of each bar in pixels
    barCategoryGap={30}        // 👈 Gap between categories
    barGap={4}                 // 👈 Gap between multiple bars (if stacked/grouped)
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="value" fill="#82ca9d" />
  </BarChart>
</ResponsiveContainer>
            </>
          )}
        </>
      )}

      {/* Transaction Table */}
      {transactions.length > 0 && (
        <>
          <h3 className="transaction-table-title">All Transactions</h3>
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td>₹{t.amount}</td>
                    <td style={{ color: t.type === 'income' ? 'green' : 'red' }}>{t.type}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td className="actions">
                      <button className="edit-btn" onClick={() => handleEdit(t)}><FaEdit /></button>
                      <button className="delete-btn" onClick={() => handleDelete(t._id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
