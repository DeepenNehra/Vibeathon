"""
Railway deployment entry point for Arogya-AI Backend
"""
import os
import sys
import uvicorn
import logging
import json
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def setup_logging():
    """Configure logging for Railway"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler()]
    )

def setup_credentials():
    """Setup Google Cloud credentials from Railway environment"""
    try:
        credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        
        if credentials_json:
            # Validate JSON
            try:
                credentials_data = json.loads(credentials_json)
                project_id = credentials_data.get('project_id', 'unknown')
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON in GOOGLE_CREDENTIALS_JSON: {e}")
                return False
            
            # Create credentials file in Railway's writable directory
            credentials_path = '/tmp/google-credentials.json'
            with open(credentials_path, 'w') as f:
                f.write(credentials_json)
            
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            print(f"✅ Google Cloud credentials configured (Project: {project_id})")
            return True
        else:
            print("⚠️ GOOGLE_CREDENTIALS_JSON not found in environment")
            print("   STT and Translation features will not be available")
            return False
            
    except Exception as e:
        print(f"❌ Error setting up Google Cloud credentials: {e}")
        return False

def validate_environment():
    """Validate required environment variables"""
    required_vars = {
        'SUPABASE_URL': 'Database connection',
        'SUPABASE_KEY': 'Database authentication',
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        if not os.getenv(var):
            missing_vars.append(f"{var} ({description})")
    
    if missing_vars:
        print("⚠️ Missing environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("   Some features may not work correctly")
    
    # Optional variables
    optional_vars = {
        'OPENAI_API_KEY': 'Whisper API fallback',
        'FRONTEND_URL': 'CORS configuration',
    }
    
    print("📊 Environment Status:")
    for var, description in optional_vars.items():
        status = "✅" if os.getenv(var) else "❌"
        print(f"   {status} {var} ({description})")

def main():
    """Main entry point for Railway deployment"""
    print("🚀 Starting Arogya-AI Backend on Railway...")
    print("=" * 50)
    
    setup_logging()
    
    # Setup credentials
    google_cloud_ok = setup_credentials()
    
    # Validate environment
    validate_environment()
    
    # Railway configuration
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"
    
    print("=" * 50)
    print(f"🌐 Server starting on {host}:{port}")
    print(f"📚 API Documentation: https://your-app.railway.app/docs")
    print(f"🔍 Health Check: https://your-app.railway.app/health")
    print("=" * 50)
    
    # Start the FastAPI server
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
        access_log=True,
        workers=1,  # Single worker for Railway
        timeout_keep_alive=30,
        timeout_graceful_shutdown=10
    )

if __name__ == "__main__":
    main()