import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import CreateExam from '../components/CreateExam';
import ManageExam from '../components/ManageExam';
import Analytics from '../components/Analytics';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
    fetchAnalytics();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await adminAPI.getExams();
      setExams(response.data.exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await adminAPI.deleteExam(examId);
        fetchExams();
        fetchAnalytics();
      } catch (error) {
        alert('Error deleting exam');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                🎓 Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                data-testid="logout-btn"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-3xl font-bold text-blue-600">{stats.total_exams}</div>
                    <div className="text-gray-600 mt-2">Total Exams</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-3xl font-bold text-green-600">{stats.total_students}</div>
                    <div className="text-gray-600 mt-2">Total Students</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-3xl font-bold text-purple-600">{stats.total_results}</div>
                    <div className="text-gray-600 mt-2">Total Attempts</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-3xl font-bold text-orange-600">{stats.avg_percentage}%</div>
                    <div className="text-gray-600 mt-2">Avg Score</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mb-8 flex gap-4">
                <Link
                  to="/admin/create-exam"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  data-testid="create-exam-btn"
                >
                  ➕ Create New Exam
                </Link>
                <Link
                  to="/admin/analytics"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  data-testid="view-analytics-btn"
                >
                  📊 View Analytics
                </Link>
              </div>

              {/* Exams List */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">All Exams</h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No exams created yet. Create your first exam!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exams.map((exam) => (
                      <div
                        key={exam.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                        data-testid={`exam-card-${exam.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">{exam.title}</h3>
                            <p className="text-gray-600 mt-2">{exam.description}</p>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                ⏱️ {exam.duration} mins
                              </span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                📝 {exam.question_count} questions
                              </span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                                💯 {exam.total_marks} marks
                              </span>
                              {exam.negative_marking && (
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                                  ⚠️ Negative Marking
                                </span>
                              )}
                              {exam.randomize_questions && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                  🔀 Randomized
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link
                              to={`/admin/exam/${exam.id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              data-testid={`edit-exam-${exam.id}`}
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              data-testid={`delete-exam-${exam.id}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          }
        />
        <Route path="/create-exam" element={<CreateExam onSuccess={fetchExams} />} />
        <Route path="/exam/:examId" element={<ManageExam onSuccess={fetchExams} />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  );
}

export default AdminDashboard;
