// 📁 src/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 handleSubmit fired, isSignup=', isSignup);

    const url = isSignup
      ? 'http://localhost:8000/signup'
      : 'http://localhost:8000/login';

    const formData = new FormData();
    if (isSignup) formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    console.log('🔗 Posting to', url, 'with', [...formData.entries()]);

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      console.log('📬 response status:', res.status, res.statusText);

      const data = await res.json().catch(() => null);
      console.log('📨 response data:', data);

      if (!res.ok) {
        const errMsg = data?.detail || data?.message || `Error ${res.status}`;
        alert(errMsg);
        return;
      }

      if (isSignup) {
        alert('✅ Account created! Please log in.');
        setIsSignup(false);
        return;
      }

      onLogin(data.name, data.email);
      navigate('/upload');
    } catch (err) {
      console.error('❌ fetch error:', err);
      alert('Network error — is the backend running with CORS enabled?');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-md dark:bg-white/10 bg-white">
      <h1 className="text-3xl font-bold text-purple-500 text-center mb-6 dark:text-purple-400">
        {isSignup ? 'Sign Up' : 'Login'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 dark:bg-white/10 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 text-black dark:text-white"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 dark:bg-white/10 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 text-black dark:text-white"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 dark:bg-white/10 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 text-black dark:text-white"
        />
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-600"
        >
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm text-black dark:text-white">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => setIsSignup((s) => !s)}
          className="text-purple-600 dark:text-purple-300 underline"
        >
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}
