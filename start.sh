#!/bin/bash

echo "🚀 Starting Arogya-AI Backend for Railway..."

# Navigate to backend directory
cd backend

# Install dependencies if not already installed
if [ ! -f ".railway_deps_installed" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    touch .railway_deps_installed
    echo "✅ Dependencies installed"
fi

# Start the application
echo "🌐 Starting FastAPI server..."
python railway_main.py