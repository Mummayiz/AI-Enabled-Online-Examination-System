import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, violationsAPI } from '../services/api';
import * as faceapi from 'face-api.js';

function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState(0);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    startExam();
    loadFaceDetectionModels();
    requestFullscreen();
    
    // Add event listeners for violations
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      stopFaceDetection();
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const startExam = async () => {
    try {
      const response = await studentAPI.startExam(examId);
      setExam(response.data.exam);
      setSession(response.data.session);
      setQuestions(response.data.questions);
      setTimeLeft(response.data.exam.duration * 60); // Convert to seconds
      setLoading(false);
      startTimer();
    } catch (error) {
      alert('Error starting exam: ' + (error.response?.data?.error || 'Unknown error'));
      navigate('/student');
    }
  };

  const loadFaceDetectionModels = async () => {
    try {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setFaceDetectionReady(true);
      startWebcam();
    } catch (error) {
      console.error('Error loading face detection models:', error);
      // Continue without face detection if models fail to load
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        startFaceDetection();
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      logViolation('no_camera', 'Unable to access webcam');
    }
  };

  const startFaceDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && faceDetectionReady) {
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );

          if (detections.length === 0) {
            logViolation('no_face', 'No face detected');
            showWarningPopup('⚠️ No face detected! Please stay in front of the camera.');
          } else if (detections.length > 1) {
            logViolation('multiple_faces', `${detections.length} faces detected`);
            showWarningPopup('⚠️ Multiple faces detected! Only you should be present.');
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    }, 4000); // Check every 4 seconds
  };

  const stopFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      logViolation('tab_switch', 'Tab switched or minimized');
      showWarningPopup('⚠️ Tab switching detected! Stay on this page.');
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      logViolation('exit_fullscreen', 'Exited fullscreen mode');
      showWarningPopup('⚠️ Fullscreen exited! Re-entering fullscreen...');
      requestFullscreen();
    }
  };

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  };

  const logViolation = async (type, details) => {
    if (!session) return;
    
    try {
      const response = await violationsAPI.logViolation({
        session_id: session.id,
        violation_type: type,
        details: details
      });
      
      const newViolationCount = response.data.violation_count;
      setViolations(newViolationCount);
      
      if (response.data.should_submit) {
        alert('⚠️ Maximum violations reached (5). Exam will be auto-submitted.');
        handleSubmit(true);
      }
    } catch (error) {
      console.error('Error logging violation:', error);
    }
  };

  const showWarningPopup = (message) => {
    setWarningMessage(message);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    
    if (!autoSubmit && !window.confirm('Are you sure you want to submit the exam?')) {
      return;
    }
    
    setSubmitting(true);
    stopTimer();
    stopFaceDetection();
    
    try {
      const response = await studentAPI.submitExam(session.id, { answers });
      
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      
      alert(`Exam submitted successfully! Score: ${response.data.result.marks_obtained}/${response.data.result.total_marks}`);
      navigate('/student');
    } catch (error) {
      alert('Error submitting exam: ' + (error.response?.data?.error || 'Unknown error'));
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading exam...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4" data-testid="exam-interface">
      {/* Warning Popup */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 violation-warning">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl text-center font-bold">
            {warningMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-gray-400 text-sm">{questions.length} Questions • {exam.total_marks} Marks</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-400">Time Left</div>
            <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-green-500'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Violations</div>
            <div className={`text-2xl font-bold ${violations >= 3 ? 'text-red-500' : 'text-yellow-500'}`}>
              {violations}/5
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6">
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-gray-700 rounded-lg p-6" data-testid={`question-${question.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">
                    Question {index + 1}
                  </h3>
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                    {question.marks} marks
                  </span>
                </div>
                
                <p className="text-white mb-4">{question.question_text}</p>
                
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <label
                      key={option}
                      className="flex items-center p-4 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-500 transition"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswerChange(question.id, option)}
                        className="mr-3 w-5 h-5"
                        data-testid={`question-${question.id}-option-${option}`}
                      />
                      <span>{option}. {question[`option_${option.toLowerCase()}`]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition disabled:opacity-50"
              data-testid="submit-exam-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>

        {/* Sidebar with Webcam */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 sticky top-4">
            <h3 className="text-lg font-bold mb-4">📹 AI Proctoring</h3>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full rounded-lg bg-black"
              data-testid="webcam-feed"
            />
            <div className="mt-4 text-sm text-gray-400">
              <p>✓ Stay in frame</p>
              <p>✓ Only one person</p>
              <p>✓ Stay in fullscreen</p>
              <p>✓ Don't switch tabs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeExam;
