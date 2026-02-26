import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

function ManageExam({ onSuccess }) {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 1,
  });

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await adminAPI.getExam(examId);
      setExam(response.data.exam);
      setQuestions(response.data.exam.questions);
    } catch (error) {
      alert('Error fetching exam');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (e) => {
    setQuestionForm({
      ...questionForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addQuestion(examId, questionForm);
      setQuestionForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        marks: 1,
      });
      setShowAddQuestion(false);
      fetchExam();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Error adding question: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await adminAPI.deleteQuestion(questionId);
        fetchExam();
        if (onSuccess) onSuccess();
      } catch (error) {
        alert('Error deleting question');
      }
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{exam.title}</h2>
        <p className="text-gray-600 mb-4">{exam.description}</p>
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            ⏱️ {exam.duration} minutes
          </span>
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full">
            💯 {exam.total_marks} marks
          </span>
          <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full">
            📝 {questions.length} questions
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Questions</h3>
          <button
            onClick={() => setShowAddQuestion(!showAddQuestion)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            data-testid="add-question-btn"
          >
            {showAddQuestion ? 'Cancel' : '➕ Add Question'}
          </button>
        </div>

        {showAddQuestion && (
          <form onSubmit={handleAddQuestion} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  name="question_text"
                  value={questionForm.question_text}
                  onChange={handleQuestionChange}
                  rows="3"
                  className="input-field"
                  required
                  data-testid="question-text-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Option A *
                  </label>
                  <input
                    type="text"
                    name="option_a"
                    value={questionForm.option_a}
                    onChange={handleQuestionChange}
                    className="input-field"
                    required
                    data-testid="option-a-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Option B *
                  </label>
                  <input
                    type="text"
                    name="option_b"
                    value={questionForm.option_b}
                    onChange={handleQuestionChange}
                    className="input-field"
                    required
                    data-testid="option-b-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Option C *
                  </label>
                  <input
                    type="text"
                    name="option_c"
                    value={questionForm.option_c}
                    onChange={handleQuestionChange}
                    className="input-field"
                    required
                    data-testid="option-c-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Option D *
                  </label>
                  <input
                    type="text"
                    name="option_d"
                    value={questionForm.option_d}
                    onChange={handleQuestionChange}
                    className="input-field"
                    required
                    data-testid="option-d-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  <select
                    name="correct_answer"
                    value={questionForm.correct_answer}
                    onChange={handleQuestionChange}
                    className="input-field"
                    required
                    data-testid="correct-answer-select"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marks *
                  </label>
                  <input
                    type="number"
                    name="marks"
                    value={questionForm.marks}
                    onChange={handleQuestionChange}
                    min="1"
                    className="input-field"
                    required
                    data-testid="marks-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                data-testid="submit-question-btn"
              >
                Add Question
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No questions added yet. Click "Add Question" to get started.
            </p>
          ) : (
            questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-6"
                data-testid={`question-${question.id}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-lg">Question {index + 1}</h4>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {question.marks} marks
                    </span>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      data-testid={`delete-question-${question.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-800 mb-4">{question.question_text}</p>
                <div className="space-y-2">
                  <div className={`p-3 rounded ${question.correct_answer === 'A' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    A. {question.option_a}
                  </div>
                  <div className={`p-3 rounded ${question.correct_answer === 'B' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    B. {question.option_b}
                  </div>
                  <div className={`p-3 rounded ${question.correct_answer === 'C' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    C. {question.option_c}
                  </div>
                  <div className={`p-3 rounded ${question.correct_answer === 'D' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    D. {question.option_d}
                  </div>
                </div>
                <p className="mt-3 text-sm text-green-700 font-semibold">
                  ✓ Correct Answer: {question.correct_answer}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageExam;
