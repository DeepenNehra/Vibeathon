#!/bin/bash
# run.sh - Optimized for Replit Hackathon

echo "🚀 Starting Arogya-AI for Replit Hackathon..."

# Set environment variables
export PYTHONPATH="/home/runner/$REPL_SLUG/backend:$PYTHONPATH"
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=512"
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

# Setup Google credentials if available
echo "🔑 Setting up credentials..."
cd backend
if [ -f "setup_credentials.py" ]; then
    python setup_credentials.py
fi
cd ..

# Install Python dependencies with cache
echo "📦 Installing Python dependencies..."
cd backend
if [ ! -f ".deps_installed" ]; then
    pip install --user -r requirements.txt
    touch .deps_installed
    echo "✅ Python dependencies installed"
else
    echo "✅ Python dependencies already installed"
fi
cd ..

# Install Node.js dependencies with cache
echo "📦 Installing Node.js dependencies..."
if [ ! -d "node_modules" ] || [ ! -f ".node_deps_installed" ]; then
    npm install --production
    touch .node_deps_installed
    echo "✅ Node.js dependencies installed"
else
    echo "✅ Node.js dependencies already installed"
fi

# Build frontend for production
echo "🏗️ Building frontend..."
if [ ! -d ".next" ] || [ ! -f ".frontend_built" ]; then
    npm run build
    touch .frontend_built
    echo "✅ Frontend built"
else
    echo "✅ Frontend already built"
fi

# Start backend
echo "🔧 Starting FastAPI backend..."
cd backend
python replit_run.py &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start in 30 seconds"
        exit 1
    fi
    sleep 1
done

# Start frontend
echo "🌐 Starting Next.js frontend..."
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Arogya-AI is running!"
echo "📱 Frontend: https://$REPL_SLUG.$REPL_OWNER.repl.co"
echo "🔧 Backend: https://$REPL_SLUG.$REPL_OWNER.repl.co:8080"
echo "📚 API Docs: https://$REPL_SLUG.$REPL_OWNER.repl.co:8080/docs"
echo ""
echo "🎥 For video calls to work:"
echo "1. Click 'Open in new tab' for HTTPS"
echo "2. Allow camera/microphone permissions"
echo "3. Use the Replit domain (not preview)"
echo ""

# Keep processes running
wait $BACKEND_PID $FRONTEND_PID