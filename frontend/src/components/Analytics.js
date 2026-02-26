import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

function Analytics() {
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examAnalytics, setExamAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, examsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getExams(),
      ]);
      setStats(statsRes.data);
      setExams(examsRes.data.exams);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamAnalytics = async (examId) => {
    try {
      const response = await adminAPI.getExamAnalytics(examId);
      setExamAnalytics(response.data);
      setSelectedExam(examId);
    } catch (error) {
      console.error('Error fetching exam analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-8">📊 Analytics Dashboard</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-4xl font-bold">{stats.total_exams}</div>
          <div className="mt-2 text-blue-100">Total Exams</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-4xl font-bold">{stats.total_students}</div>
          <div className="mt-2 text-green-100">Total Students</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-4xl font-bold">{stats.total_results}</div>
          <div className="mt-2 text-purple-100">Total Attempts</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-4xl font-bold">{stats.avg_percentage}%</div>
          <div className="mt-2 text-orange-100">Average Score</div>
        </div>
      </div>

      {/* Exam-wise Analytics */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Exam-wise Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => fetchExamAnalytics(exam.id)}
              className={`p-6 rounded-lg border-2 transition text-left ${ 
                selectedExam === exam.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
              data-testid={`exam-analytics-${exam.id}`}
            >
              <h4 className="font-bold text-lg text-gray-800">{exam.title}</h4>
              <p className="text-sm text-gray-600 mt-2">{exam.question_count} questions</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Exam Analytics */}
      {examAnalytics && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {examAnalytics.exam.title} - Detailed Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {examAnalytics.total_attempts}
              </div>
              <div className="text-gray-600 mt-2">Total Attempts</div>
            </div>
            <div className="p-6 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {examAnalytics.avg_percentage}%
              </div>
              <div className="text-gray-600 mt-2">Average Score</div>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {examAnalytics.pass_rate}%
              </div>
              <div className="text-gray-600 mt-2">Pass Rate</div>
            </div>
            <div className="p-6 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {examAnalytics.passed_count}/{examAnalytics.total_attempts}
              </div>
              <div className="text-gray-600 mt-2">Passed/Total</div>
            </div>
          </div>

          {/* Results Table */}
          {examAnalytics.results && examAnalytics.results.length > 0 && (
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Recent Results</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Violations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {examAnalytics.results.map((result) => (
                      <tr key={result.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Student #{result.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.marks_obtained}/{result.total_marks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.percentage.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`font-semibold ${
                            result.violation_count >= 3 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {result.violation_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Analytics;
