import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('exams');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
    fetchResults();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await studentAPI.getExams();
      setExams(response.data.exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await studentAPI.getResults();
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                🎓 Student Dashboard
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'exams'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            data-testid="exams-tab"
          >
            📝 Available Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'results'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            data-testid="results-tab"
          >
            📊 My Results
          </button>
        </div>

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Exams</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No exams available at the moment.</p>
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
                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                            ⏱️ {exam.duration} minutes
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                            📝 {exam.question_count} questions
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                            💯 {exam.total_marks} marks
                          </span>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            ✅ Passing: {exam.passing_marks} marks
                          </span>
                        </div>
                        
                        {exam.already_taken && (
                          <div className="mt-3 px-4 py-2 bg-green-50 text-green-700 rounded-lg inline-block">
                            ✅ Already Completed
                          </div>
                        )}
                        
                        {!exam.is_available && !exam.already_taken && (
                          <div className="mt-3 px-4 py-2 bg-red-50 text-red-700 rounded-lg inline-block">
                            ⏰ Not Available Now
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        {!exam.already_taken && exam.is_available ? (
                          <button
                            onClick={() => handleStartExam(exam.id)}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                            data-testid={`start-exam-${exam.id}`}
                          >
                            Start Exam
                          </button>
                        ) : exam.already_taken ? (
                          <button
                            disabled
                            className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                          >
                            Completed
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Results</h2>
            
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No results yet. Take an exam to see your results here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                    data-testid={`result-card-${result.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{result.exam_title}</h3>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">Score</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {result.marks_obtained}/{result.total_marks}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Percentage</div>
                            <div className="text-2xl font-bold text-purple-600">
                              {result.percentage.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Status</div>
                            <div className={`text-2xl font-bold ${
                              result.passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.passed ? '✅ Passed' : '❌ Failed'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Violations</div>
                            <div className="text-2xl font-bold text-orange-600">
                              {result.violation_count}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-4 text-sm">
                          <span className="text-green-600">✅ Correct: {result.correct_answers}</span>
                          <span className="text-red-600">❌ Wrong: {result.wrong_answers}</span>
                          <span className="text-gray-600">⚪ Unanswered: {result.unanswered}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
