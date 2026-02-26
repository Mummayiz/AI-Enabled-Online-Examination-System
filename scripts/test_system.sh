#!/bin/bash

echo "======================================"
echo "Testing AI-Enabled Exam System"
echo "======================================"
echo ""

# Test backend health
echo "1. Testing Backend API..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/auth/me)
if [ "$BACKEND_RESPONSE" == "401" ]; then
    echo "   ✓ Backend is running (Expected 401 Unauthorized)"
else
    echo "   ✗ Backend issue (Got HTTP $BACKEND_RESPONSE)"
fi
echo ""

# Test frontend
echo "2. Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s http://localhost:3000 | grep -c "Exam Portal")
if [ "$FRONTEND_RESPONSE" -gt 0 ]; then
    echo "   ✓ Frontend is serving pages"
else
    echo "   ✗ Frontend issue"
fi
echo ""

# Test student registration
echo "3. Testing Student Registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{"username":"teststudent","email":"student@test.com","password":"test123"}')

if echo "$REGISTER_RESPONSE" | grep -q "registered successfully"; then
    echo "   ✓ Student registration working"
else
    if echo "$REGISTER_RESPONSE" | grep -q "already"; then
        echo "   ✓ Student registration API working (user exists)"
    else
        echo "   ✗ Student registration failed"
        echo "   Response: $REGISTER_RESPONSE"
    fi
fi
echo ""

# Test admin registration
echo "4. Testing Admin Registration..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","email":"admin@test.com","password":"admin123"}')

if echo "$ADMIN_RESPONSE" | grep -q "registered successfully"; then
    echo "   ✓ Admin registration working"
else
    if echo "$ADMIN_RESPONSE" | grep -q "already"; then
        echo "   ✓ Admin registration API working (user exists)"
    else
        echo "   ✗ Admin registration failed"
        echo "   Response: $ADMIN_RESPONSE"
    fi
fi
echo ""

# Test login
echo "5. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  -c /tmp/cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
    echo "   ✓ Login working"
else
    echo "   ✗ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
fi
echo ""

# Check supervisor status
echo "6. Checking Services Status..."
sudo supervisorctl status | grep -E "backend|frontend"
echo ""

echo "======================================"
echo "Test Summary Complete!"
echo "======================================"
