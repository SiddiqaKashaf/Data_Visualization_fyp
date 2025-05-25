// 📁 src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';
import {
  HiSparkles,
  HiUserCircle,
  HiLogout
} from 'react-icons/hi';
import { UploadDataPage } from './UploadDataPage';
import { VisualizationPage } from './VisualizationPage';
import LoginPage from './LoginPage';
import ProfilePage from './ProfilePage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [columnNames, setColumnNames] = useState([]);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  // Persist & apply theme
useEffect(() => { setDark(localStorage.getItem('theme') === 'dark'); }, []);
useEffect(() => {
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', dark);
}, [dark]);

  // Called by LoginPage after successful login
 const handleLogin = (name, email) => {
  // ✅ Reset all user-specific state and localStorage
  localStorage.removeItem('lastUploadedData');
  setParsedData([]);
  setColumnNames([]);
  setUserName(name);
  setUserEmail(email);
  setIsLoggedIn(true);
  // Optional: force a full reload (if needed)
  // window.location.reload();
};


  // Logout clears everything
const handleLogout = () => {
  setIsLoggedIn(false);
  setUserName('');
  setUserEmail('');
  setParsedData([]);
  setColumnNames([]);
  localStorage.removeItem('lastUploadedData');
};


  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 transition-colors duration-300">
        {/* Navbar (only when logged in) */}
        {isLoggedIn && (
          <nav className="bg-gray-100 dark:bg-white/5 border border-white/10 backdrop-blur-md shadow-lg sticky top-0 z-50 rounded-b-2xl">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <Link
                to="/upload"
                className="text-3xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2"
              >
                <HiSparkles className="animate-spin-slow" /> DataVision
              </Link>

              <div className="flex items-center space-x-4">
                <Link to="/upload" className="hover:underline">
                  Upload
                </Link>
                <Link to="/visualize" className="hover:underline">
                  Visualize
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-1 hover:underline"
                >
                  <HiUserCircle className="w-5 h-5" />
                  <span className="capitalize">{userName || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:underline"
                >
                  <HiLogout className="w-5 h-5" /> Logout
                </button>
                <button
                  onClick={() => setDark(!dark)}
                  className="bg-purple-600 px-3 py-1 rounded-full text-sm text-white hover:bg-purple-700"
                >
                  {dark ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          </nav>
        )}

        <main className="container mx-auto px-6 py-10">
          <Routes>
            {isLoggedIn ? (
              // Protected routes
              <>
                <Route
                  path="/upload"
                  element={
                    <UploadDataPage
                      setParsedData={setParsedData}
                      setColumnNames={setColumnNames}
                    />
                  }
                />
                <Route
                  path="/visualize"
                  element={
                    <VisualizationPage
                      data={parsedData}
                      columns={columnNames}
                      dark={dark}
                      userEmail={userEmail}
                    />
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProfilePage
                      name={userName}
                      email={userEmail}
                    />
                  }
                />
                <Route path="/" element={<Navigate to="/upload" replace />} />
                <Route path="*" element={<Navigate to="/upload" replace />} />
              </>
            ) : (
              // Public routes
              <>
                <Route
                  path="/login"
                  element={<LoginPage onLogin={handleLogin} />}
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
