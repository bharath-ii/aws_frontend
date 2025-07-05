
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import {
  FaMoneyBillWave, FaArrowDown, FaBalanceScale,
  FaBars, FaCalendarAlt, FaClipboardList, FaInfoCircle
} from 'react-icons/fa';
import '../App.css';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarSummary, setCalendarSummary] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

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

  useEffect(() => {
    let timeout;
    if (showInfo) {
      timeout = setTimeout(() => setShowInfo(false), 8000); // ⏱️ 8 seconds
    }
    return () => clearTimeout(timeout);
  }, [showInfo]);

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  const COLORS = ['#ff6384', '#36a2eb', '#ffce56', '#8bc34a', '#e91e63', '#9c27b0'];

  const categoryData = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
  });

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const lineData = transactions.filter(t => t.type === 'expense').map(t => ({
    date: new Date(t.date).toLocaleDateString(),
    amount: t.amount
  }));
  const barData = pieData;

  const renderCustomCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekdays = ['🌞 Sun', '🌙 Mon', '🔥 Tue', '🍀 Wed', '🌊 Thu', '🌟 Fri', '🎉 Sat'];

    const handleClick = (day) => {
      const clicked = new Date(year, month, day).toDateString();
      setSelectedDate(clicked);
      const filtered = transactions.filter(t => new Date(t.date).toDateString() === clicked);
      const total = filtered.reduce((sum, t) => sum + t.amount, 0);
      setCalendarSummary({ date: clicked, total, count: filtered.length });
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white', padding: '20px', zIndex: 999,
        borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ textAlign: 'center' }}>📅 Select a Date</h3>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px', marginTop: '10px'
        }}>
          {weekdays.map((day, i) => (
            <div key={i} style={{
              fontWeight: 'bold', textAlign: 'center',
              padding: '5px', background: '#f1f1f1', borderRadius: '6px'
            }}>{day}</div>
          ))}
          {cells.map((day, i) => (
            <div
              key={i}
              onClick={() => day && handleClick(day)}
              style={{
                height: '50px', lineHeight: '50px', textAlign: 'center',
                background: day ? '#e0e0e0' : 'transparent',
                borderRadius: '6px', cursor: day ? 'pointer' : 'default'
              }}
            >
              {day}
            </div>
          ))}
        </div>
        {calendarSummary && (
          <div style={{
            marginTop: '20px', background: '#f0f9ff',
            padding: '10px', borderRadius: '8px', textAlign: 'center'
          }}>
            <h4>{calendarSummary.date}</h4>
            <p>Total Transactions: {calendarSummary.count}</p>
            <p>Total Amount: ₹{calendarSummary.total}</p>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button onClick={() => setShowCalendar(false)}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      {/* Side Drawer */}
      {showDrawer && (
        <div style={{
          position: 'absolute', top: 60, left: 0,
          background: '#222', color: '#fff',
          padding: '15px', borderRadius: '0 10px 10px 0',
          zIndex: 100
        }}>
          <div
            onClick={() => { navigate('/transactions'); setShowDrawer(false); }}
            style={{ cursor: 'pointer', marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <FaClipboardList /> Transactions
          </div>
          <div
            onClick={() => { setShowCalendar(true); setShowDrawer(false); }}
            style={{ cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <FaCalendarAlt /> Calendar
          </div>
        </div>
      )}

      {/* Calendar Popup */}
      {showCalendar && renderCustomCalendar()}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
        <FaBars size={22} style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => setShowDrawer(!showDrawer)} />
        <h2 style={{ margin: '0 auto', textAlign: 'center', flex: 1 }}>MY BUDGET TRACKER</h2>
        <div style={{ position: 'absolute', right: 0, top: '5px' }}>
          <FaInfoCircle
            size={20}
            style={{ cursor: 'pointer', color: '#888' }}
            onClick={() => setShowInfo(true)}
          />
          {showInfo && (
            <div style={{
              position: 'absolute',
              top: '30px',
              right: '0',
              backgroundColor: '#fff',
              padding: '12px',
              borderRadius: '10px',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
              width: '270px',
              fontSize: '14px',
              zIndex: 1000,
              animation: 'slideIn 0.3s ease-in-out'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <strong>🚀 AI-Powered Banking</strong>
                <span
                  style={{ cursor: 'pointer', marginLeft: '10px', color: '#888' }}
                  onClick={() => setShowInfo(false)}
                >×</span>
              </div>
              <p style={{ marginTop: '8px' }}>
                Now use this app we quickly launch our  AI-integrated direct bank transactions! using your banking app.
              </p>
              <a href="https://your-bank-app-link.com" target="_blank" rel="noopener noreferrer" style={{
                color: '#007bff',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}>Open Bank App</a>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', marginBottom: '20px' }}>
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

      {/* Add Transaction Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/add')}>+ Add Transaction</button>
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
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
        </div>
      )}

      {/* Line Chart */}
      {lineData.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
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
        </div>
      )}

      {/* Bar Chart */}
      {barData.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3>Category-wise Expenses (Bar)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
