import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      setMessage(response.data.message);
      
      // For development only - display the token
      if (response.data.token) {
        setResetToken(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Forgot Password 🔑</h2>
            <p className="text-gray-600 mt-2">Enter your email to reset your password</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {message}
              {resetToken && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Development Mode - Your Reset Token:</p>
                  <div className="bg-white p-3 rounded border border-green-300 break-all text-sm font-mono">
                    {resetToken}
                  </div>
                  <Link 
                    to={`/reset-password?token=${resetToken}`}
                    className="inline-block mt-3 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    → Click here to reset your password
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link to="/login" className="block text-blue-600 hover:text-blue-800 font-semibold">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
