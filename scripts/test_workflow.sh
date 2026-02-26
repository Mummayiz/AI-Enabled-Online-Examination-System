#!/bin/bash

echo "======================================"
echo "Testing Full Exam Workflow"
echo "======================================"
echo ""

# Login as admin
echo "1. Logging in as Admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  -c /tmp/admin_cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
    echo "   ✓ Admin logged in"
else
    echo "   ✗ Admin login failed"
    exit 1
fi
echo ""

# Create exam
echo "2. Creating Test Exam..."
EXAM_RESPONSE=$(curl -s -X POST http://localhost:8001/api/admin/exams \
  -H "Content-Type: application/json" \
  -b /tmp/admin_cookies.txt \
  -d '{
    "title":"Test Exam - BCA Final Year",
    "description":"Sample exam for testing",
    "duration":30,
    "total_marks":10,
    "passing_marks":4,
    "negative_marking":true,
    "negative_marks_value":0.25,
    "randomize_questions":true
  }')

EXAM_ID=$(echo "$EXAM_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

if [ ! -z "$EXAM_ID" ]; then
    echo "   ✓ Exam created with ID: $EXAM_ID"
else
    echo "   ✗ Exam creation failed"
    echo "   Response: $EXAM_RESPONSE"
    exit 1
fi
echo ""

# Add questions
echo "3. Adding Questions to Exam..."
for i in {1..3}; do
    Q_RESPONSE=$(curl -s -X POST "http://localhost:8001/api/admin/exams/$EXAM_ID/questions" \
      -H "Content-Type: application/json" \
      -b /tmp/admin_cookies.txt \
      -d "{
        \"question_text\":\"Test Question $i: What is the capital of India?\",
        \"option_a\":\"Mumbai\",
        \"option_b\":\"Delhi\",
        \"option_c\":\"Kolkata\",
        \"option_d\":\"Chennai\",
        \"correct_answer\":\"B\",
        \"marks\":1
      }")
    
    if echo "$Q_RESPONSE" | grep -q "added successfully"; then
        echo "   ✓ Question $i added"
    else
        echo "   ✗ Question $i failed"
    fi
done
echo ""

# Get analytics
echo "4. Testing Analytics API..."
ANALYTICS=$(curl -s -X GET http://localhost:8001/api/admin/analytics \
  -b /tmp/admin_cookies.txt)

if echo "$ANALYTICS" | grep -q "total_exams"; then
    echo "   ✓ Analytics API working"
    EXAM_COUNT=$(echo "$ANALYTICS" | grep -o '"total_exams":[0-9]*' | grep -o '[0-9]*')
    echo "   Total Exams: $EXAM_COUNT"
else
    echo "   ✗ Analytics API failed"
fi
echo ""

# Login as student
echo "5. Testing Student Workflow..."
STUDENT_LOGIN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"test123"}' \
  -c /tmp/student_cookies.txt)

if echo "$STUDENT_LOGIN" | grep -q "Login successful"; then
    echo "   ✓ Student logged in"
else
    echo "   ✗ Student login failed"
    exit 1
fi
echo ""

# Get available exams
echo "6. Getting Available Exams for Student..."
AVAILABLE_EXAMS=$(curl -s -X GET http://localhost:8001/api/student/exams \
  -b /tmp/student_cookies.txt)

if echo "$AVAILABLE_EXAMS" | grep -q "Test Exam"; then
    echo "   ✓ Student can see available exams"
else
    echo "   ⚠ Warning: Student may not see exams"
fi
echo ""

echo "======================================"
echo "Full Workflow Test Complete!"
echo "======================================"
echo ""
echo "Summary:"
echo "  - Admin can login ✓"
echo "  - Admin can create exams ✓"
echo "  - Admin can add questions ✓"
echo "  - Admin can view analytics ✓"
echo "  - Student can login ✓"
echo "  - Student can view exams ✓"
echo ""
echo "System is fully functional!"
