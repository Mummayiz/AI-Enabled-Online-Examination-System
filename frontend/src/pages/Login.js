import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      const role = response.user.role;
      navigate(role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in" data-testid="login-form">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back! 👋</h2>
            <p className="text-gray-600 mt-2">Sign in to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                data-testid="email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                data-testid="password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
              data-testid="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register/student" className="text-blue-600 font-semibold hover:underline">
                Register as Student
              </Link>
            </p>
            <p className="text-gray-600">
              <Link to="/register/admin" className="text-purple-600 font-semibold hover:underline">
                Register as Admin
              </Link>
            </p>
            <Link to="/" className="block text-sm text-gray-500 hover:text-gray-700 mt-4">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
