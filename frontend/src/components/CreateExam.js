import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

function CreateExam({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: false,
    negative_marks_value: 0.25,
    randomize_questions: false,
    start_time: '',
    end_time: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminAPI.createExam(formData);
      alert('Exam created successfully!');
      if (onSuccess) onSuccess();
      navigate(`/admin/exam/${response.data.exam.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Exam</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exam Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                required
                data-testid="exam-title-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="input-field"
                data-testid="exam-description-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                className="input-field"
                required
                data-testid="exam-duration-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Marks *
              </label>
              <input
                type="number"
                name="total_marks"
                value={formData.total_marks}
                onChange={handleChange}
                min="1"
                className="input-field"
                required
                data-testid="exam-total-marks-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Passing Marks *
              </label>
              <input
                type="number"
                name="passing_marks"
                value={formData.passing_marks}
                onChange={handleChange}
                min="1"
                className="input-field"
                required
                data-testid="exam-passing-marks-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time (Optional)
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="input-field"
                data-testid="exam-start-time-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time (Optional)
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="input-field"
                data-testid="exam-end-time-input"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="negative_marking"
                checked={formData.negative_marking}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600"
                data-testid="negative-marking-checkbox"
              />
              <label className="ml-3 text-sm font-semibold text-gray-700">
                Enable Negative Marking
              </label>
            </div>

            {formData.negative_marking && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Negative Marks Value
                </label>
                <input
                  type="number"
                  name="negative_marks_value"
                  value={formData.negative_marks_value}
                  onChange={handleChange}
                  step="0.25"
                  min="0"
                  className="input-field"
                  data-testid="negative-marks-value-input"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                name="randomize_questions"
                checked={formData.randomize_questions}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600"
                data-testid="randomize-questions-checkbox"
              />
              <label className="ml-3 text-sm font-semibold text-gray-700">
                Randomize Question Order
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              data-testid="create-exam-submit-btn"
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExam;
