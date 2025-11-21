// 📁 src/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { HiOutlineUser, HiUpload, HiChartBar, HiClock } from 'react-icons/hi';

export default function ProfilePage({ name, email }) {
  const [stats, setStats] = useState({
    uploads: 0,
    charts: 0,
    lastLogin: 'Never',
  });

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    
    // Update last login time
    const now = new Date().toLocaleString();
    const newStats = savedStats ? JSON.parse(savedStats) : stats;
    newStats.lastLogin = now;
    localStorage.setItem('userStats', JSON.stringify(newStats));
    setStats(newStats);
  }, []);

  const incrementUploads = () => {
    const current = JSON.parse(localStorage.getItem('userStats') || JSON.stringify(stats));
    current.uploads = (current.uploads || 0) + 1;
    localStorage.setItem('userStats', JSON.stringify(current));
    setStats(current);
  };

  const incrementCharts = () => {
    const current = JSON.parse(localStorage.getItem('userStats') || JSON.stringify(stats));
    current.charts = (current.charts || 0) + 1;
    localStorage.setItem('userStats', JSON.stringify(current));
    setStats(current);
  };

  // Export functions for other components to use
  window.updateUploadStats = incrementUploads;
  window.updateChartStats = incrementCharts;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = e => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    // TODO: call backend API to change password
    alert('Password change submitted.');
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-8 bg-white/10 dark:bg-white/5 rounded-2xl shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-4 bg-purple-600 dark:bg-purple-400 text-white rounded-full">
          <HiOutlineUser className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hello, {name}!</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">{email}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center p-4 bg-white/20 dark:bg-white/10 rounded-2xl shadow">
          <HiUpload className="w-6 h-6 text-purple-500 mr-3" />
          <div>
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{stats.uploads}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Data Uploads</div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-white/20 dark:bg-white/10 rounded-2xl shadow">
          <HiChartBar className="w-6 h-6 text-green-500 mr-3" />
          <div>
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{stats.charts}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Charts Created</div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-white/20 dark:bg-white/10 rounded-2xl shadow">
          <HiClock className="w-6 h-6 text-yellow-500 mr-3" />
          <div>
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{stats.lastLogin}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Last Login</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-300 dark:border-gray-600" />

      {/* Password Change Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-lg shadow hover:from-purple-700 hover:to-indigo-600 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
);
}
