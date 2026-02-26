import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/student');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 fade-in">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              🎓 Exam Portal
            </h1>
            <p className="text-xl text-gray-600">
              AI-Enabled Online Examination System
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">👨‍🎓 Students</h2>
              <p className="text-gray-600 mb-6">
                Take exams with AI-powered proctoring and view your results
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  data-testid="student-login-btn"
                >
                  Login
                </Link>
                <Link
                  to="/register/student"
                  className="block w-full py-3 px-6 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300"
                  data-testid="student-register-btn"
                >
                  Register
                </Link>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">👨‍💼 Administrators</h2>
              <p className="text-gray-600 mb-6">
                Create and manage exams, monitor results and analytics
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  data-testid="admin-login-btn"
                >
                  Login
                </Link>
                <Link
                  to="/register/admin"
                  className="block w-full py-3 px-6 bg-white border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-300"
                  data-testid="admin-register-btn"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">✨ Features</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>🤖 AI-Powered Proctoring</div>
              <div>⏱️ Timed Examinations</div>
              <div>📊 Real-time Analytics</div>
              <div>🔒 Secure & Reliable</div>
              <div>📱 Student Friendly UI</div>
              <div>⚡ Instant Results</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
