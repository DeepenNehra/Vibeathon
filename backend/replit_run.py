"""
Replit-optimized FastAPI server for Arogya-AI Hackathon
"""
import os
import sys
import uvicorn
import logging
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

def setup_logging():
    """Setup logging for Replit"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler()]
    )

def setup_credentials():
    """Setup Google Cloud credentials from Replit secrets"""
    try:
        from setup_credentials import setup_google_credentials
        setup_google_credentials()
        print("✅ Google Cloud credentials configured")
    except Exception as e:
        print(f"⚠️ Google Cloud credentials not configured: {e}")
        print("   Add GOOGLE_CREDENTIALS_JSON to Replit Secrets for STT features")

def main():
    """Main entry point for Replit"""
    print("🚀 Starting Arogya-AI Backend on Replit...")
    
    setup_logging()
    setup_credentials()
    
    # Replit configuration
    host = "0.0.0.0"
    port = int(os.getenv("PORT", 8000))
    
    # Get Repl info for logging
    repl_slug = os.getenv("REPL_SLUG", "arogya-ai")
    repl_owner = os.getenv("REPL_OWNER", "username")
    
    print(f"🌐 Backend starting on {host}:{port}")
    print(f"📚 API docs: https://{repl_slug}.{repl_owner}.repl.co:8080/docs")
    print(f"🔗 Health check: https://{repl_slug}.{repl_owner}.repl.co:8080/health")
    
    # Start server with Replit-optimized settings
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
        access_log=True,
        workers=1,
        timeout_keep_alive=30,
        timeout_graceful_shutdown=10
    )

if __name__ == "__main__":
    main()