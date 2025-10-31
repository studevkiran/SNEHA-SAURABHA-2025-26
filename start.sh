#!/bin/bash

# SNEHA-SAURABHA 2025-26 - Complete Startup Script
# This script starts both frontend and backend servers

echo "🚀 Starting SNEHA-SAURABHA 2025-26 Conference Registration System"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ Python version: $(python3 --version)"
echo ""

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo "✅ Dependencies installed"
    echo ""
fi

echo "🔧 Starting servers..."
echo ""

# Start backend server in background
echo "💻 Starting Backend Server (Port 3000)..."
cd backend && node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server in background
echo "🌐 Starting Frontend Server (Port 8000)..."
python3 -m http.server 8000 --bind 127.0.0.1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 2

echo ""
echo "✅ Both servers are running!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📱 Open your browser and go to:"
echo "     http://localhost:8000"
echo ""
echo "  💳 Backend API running at:"
echo "     http://localhost:3000"
echo ""
echo "  ⚠️  Environment: TEST MODE"
echo "     Using Instamojo TEST gateway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for user to stop
wait
