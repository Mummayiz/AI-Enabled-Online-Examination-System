# 🎓 AI-Enabled Online Examination System - Deployment Guide

## ✅ System Status: FULLY OPERATIONAL

### 🚀 Quick Start

The system is already running! Access it at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api

### 👥 Test Accounts

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`

**Student Account:**
- Email: `student@test.com`
- Password: `test123`

---

## 📋 Features Implemented

### ✨ Core Features
- ✅ Role-based authentication (Admin & Student)
- ✅ Separate registration pages for Admin and Student
- ✅ MCQ-based timed examinations
- ✅ Automatic evaluation
- ✅ Result analytics dashboard

### 🎯 Exam Features
- ✅ Exam scheduling (start/end times)
- ✅ Randomized question order
- ✅ Negative marking support
- ✅ Custom marks per question
- ✅ Passing marks configuration

### 🤖 AI Proctoring (Browser-Based)
- ✅ **face-api.js** integration (TinyFaceDetector)
- ✅ Webcam activation on exam start
- ✅ Face detection every 4 seconds
- ✅ Detects: No face, Multiple faces
- ✅ Tab switching detection (Page Visibility API)
- ✅ Fullscreen enforcement
- ✅ Violation counter (5 violations → auto-submit)
- ✅ Immediate warning popups
- ✅ Violation logging to backend

### 📊 Admin Dashboard
- ✅ Create/Edit/Delete exams
- ✅ Add/Edit/Delete questions
- ✅ View all students and results
- ✅ Analytics dashboard
- ✅ Exam-wise performance analytics

### 🎓 Student Dashboard
- ✅ View available exams
- ✅ Take exams with AI proctoring
- ✅ View results history
- ✅ Detailed score breakdown

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Flask 3.0.0
- **Authentication**: Flask-Login
- **ORM**: Flask-SQLAlchemy 3.1.1
- **Database**: 
  - Development: SQLite
  - Production: PostgreSQL (via psycopg2-binary)
- **ASGI**: asgiref (for uvicorn compatibility)
- **Server**: Gunicorn (production) / Uvicorn (development)

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.20.1
- **HTTP Client**: Axios 1.6.2
- **Styling**: Tailwind CSS 3.x
- **AI Proctoring**: face-api.js 0.22.2

### Database Models
- **User** (with role: admin/student)
- **Exam** (with all configurations)
- **Question** (MCQ with 4 options)
- **ExamSession** (tracks student attempts)
- **Violation** (logs proctoring violations)
- **Result** (stores exam results)

---

## 📁 Project Structure

```
/app
├── backend/
│   ├── app.py                 # Flask app factory
│   ├── models.py              # SQLAlchemy models
│   ├── server.py              # ASGI wrapper
│   ├── run.py                 # Development entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── routes/
│       ├── auth.py            # Authentication APIs
│       ├── admin.py           # Admin APIs
│       ├── student.py         # Student APIs
│       ├── violations.py      # Violation tracking
│       └── results.py         # Results APIs
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── models/            # face-api.js models
│   ├── src/
│   │   ├── App.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── StudentRegister.js
│   │   │   ├── AdminRegister.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── StudentDashboard.js
│   │   │   └── TakeExam.js
│   │   └── components/
│   │       ├── CreateExam.js
│   │       ├── ManageExam.js
│   │       └── Analytics.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
├── scripts/
│   ├── download_models.sh     # Download face-api models
│   ├── test_system.sh         # System tests
│   └── test_workflow.sh       # Workflow tests
│
├── Procfile                   # Render deployment
├── runtime.txt                # Python version
└── README.md
```

---

## 🔧 Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Yarn

### Backend Setup
```bash
cd /app/backend
pip install -r requirements.txt
python run.py
```

### Frontend Setup
```bash
cd /app/frontend
yarn install
yarn start
```

### Download Face Detection Models
```bash
bash /app/scripts/download_models.sh
```

---

## 🚀 Render Deployment

### Files Already Configured
✅ **Procfile** - Gunicorn command for production
✅ **requirements.txt** - All Python dependencies
✅ **runtime.txt** - Python 3.11.6

### Deployment Steps

1. **Create Render Account** at https://render.com

2. **Create PostgreSQL Database**
   - Go to Dashboard → New → PostgreSQL
   - Note the database URL

3. **Create Web Service**
   - Go to Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: `exam-system`
     - **Environment**: `Python 3`
     - **Build Command**: 
       ```bash
       pip install -r backend/requirements.txt && cd frontend && yarn install && yarn build
       ```
     - **Start Command**: 
       ```bash
       cd backend && gunicorn server:app --bind 0.0.0.0:$PORT
       ```
     - **Environment Variables**:
       - `SECRET_KEY`: (generate random string)
       - `DATABASE_URL`: (from PostgreSQL instance)

4. **Deploy!**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Environment Variables

**Required:**
- `SECRET_KEY`: Flask secret key (generate using: `python -c "import secrets; print(secrets.token_hex(32))"`)
- `DATABASE_URL`: PostgreSQL connection string (auto-provided by Render)

**Optional:**
- `FLASK_ENV`: `production` (default)

---

## 🧪 Testing

### Run System Tests
```bash
bash /app/scripts/test_system.sh
```

### Run Workflow Tests
```bash
bash /app/scripts/test_workflow.sh
```

### Manual Testing Checklist

#### Admin Flow:
1. Register at `/register/admin`
2. Login at `/login`
3. Create exam with:
   - Scheduling
   - Negative marking
   - Randomization
4. Add questions (MCQs with 4 options)
5. View analytics

#### Student Flow:
1. Register at `/register/student`
2. Login at `/login`
3. View available exams
4. Start exam (allow webcam access)
5. Answer questions
6. System monitors:
   - Face detection
   - Tab switching
   - Fullscreen status
7. Submit exam
8. View results

---

## 🔐 Security Features

- ✅ Password hashing (Werkzeug)
- ✅ Session-based authentication
- ✅ CORS protection
- ✅ CSRF protection (Flask-WTF ready)
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ XSS protection (React escaping)
- ✅ Violation logging
- ✅ Fullscreen enforcement

---

## 📊 Database Schema

### Users Table
- id, username, email, password_hash, role, created_at

### Exams Table
- id, title, description, duration, total_marks, passing_marks
- negative_marking, negative_marks_value, randomize_questions
- start_time, end_time, created_by, created_at, is_active

### Questions Table
- id, exam_id, question_text, option_a, option_b, option_c, option_d
- correct_answer, marks, created_at

### ExamSessions Table
- id, student_id, exam_id, start_time, end_time, answers
- is_completed, violation_count, auto_submitted

### Violations Table
- id, session_id, violation_type, timestamp, details

### Results Table
- id, student_id, exam_id, session_id, marks_obtained, total_marks
- percentage, passed, correct_answers, wrong_answers, unanswered
- violation_count, created_at

---

## 🎨 UI/UX Features

- 🌈 Gradient backgrounds
- 💫 Smooth animations
- 📱 Responsive design
- 🎯 Student-friendly interface
- ⚡ Fast page loads
- 🔔 Real-time warnings
- 📊 Visual analytics

---

## 🐛 Troubleshooting

### Backend not starting
```bash
sudo supervisorctl restart backend
tail -f /var/log/supervisor/backend.err.log
```

### Frontend not loading
```bash
sudo supervisorctl restart frontend
tail -f /var/log/supervisor/frontend.err.log
```

### Database connection issues
- Check `DATABASE_URL` in `/app/backend/.env`
- For SQLite: File permissions on `exam_system.db`
- For PostgreSQL: Connection string format

### Face detection not working
- Ensure models are downloaded: `bash /app/scripts/download_models.sh`
- Check browser console for errors
- Allow webcam permissions in browser

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/admin` - Admin registration
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/exams` - List all exams
- `POST /api/admin/exams` - Create exam
- `GET /api/admin/exams/:id` - Get exam details
- `PUT /api/admin/exams/:id` - Update exam
- `DELETE /api/admin/exams/:id` - Delete exam
- `POST /api/admin/exams/:id/questions` - Add question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/analytics` - Overall analytics
- `GET /api/admin/exams/:id/analytics` - Exam-specific analytics

### Student
- `GET /api/student/exams` - List available exams
- `POST /api/student/exams/:id/start` - Start exam
- `POST /api/student/sessions/:id/submit` - Submit exam
- `GET /api/student/results` - Get my results
- `GET /api/student/results/:id` - Get result details

### Violations
- `POST /api/violations` - Log violation
- `GET /api/violations/session/:id` - Get session violations

---

## 🎓 BCA Final Year Project Documentation

### Project Title
**AI-Enabled Online Examination System with Smart Browser-Based Proctoring**

### Objectives Met
✅ Role-based authentication system
✅ Comprehensive exam management
✅ MCQ-based automatic evaluation
✅ AI-powered browser proctoring
✅ Real-time violation detection
✅ Analytics and reporting
✅ Production-ready deployment
✅ Clean architecture

### Technologies Used
- **Frontend**: React.js, Tailwind CSS, face-api.js
- **Backend**: Flask, SQLAlchemy
- **Database**: PostgreSQL/SQLite
- **AI**: TinyFaceDetector (browser-based)
- **Deployment**: Render Cloud Platform

### Key Achievements
- 🚫 **No OpenCV** - Pure browser-based AI
- 🚫 **No backend camera access** - Privacy-focused
- ✅ **Production-ready** - Render deployment configured
- ✅ **Scalable** - Clean architecture
- ✅ **Secure** - Multiple security layers

---

## 📧 Support

For issues or questions:
1. Check logs: `/var/log/supervisor/`
2. Run tests: `bash /app/scripts/test_system.sh`
3. Review this guide

---

## 📄 License

MIT License - Free for educational and commercial use

---

**System Status**: ✅ FULLY OPERATIONAL
**Last Updated**: February 26, 2025
**Version**: 1.0.0
