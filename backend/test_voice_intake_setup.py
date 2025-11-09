"""
Test script to verify Voice Intake setup is complete
"""
import os
import sys
from pathlib import Path

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / '.env'
    load_dotenv(dotenv_path=env_path)
    print(f"✅ Loaded .env file from: {env_path}")
except ImportError:
    print("⚠️  python-dotenv not installed. Install with: pip install python-dotenv")
    print("   Trying to read .env manually...")
    # Manual .env loading as fallback
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        print(f"✅ Manually loaded .env file from: {env_path}")

print("=" * 60)
print("VOICE INTAKE SETUP VERIFICATION")
print("=" * 60)

# Test 1: Check environment variables
print("\n1. Checking Environment Variables...")
print("-" * 60)

env_vars = {
    'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY'),
    'GOOGLE_APPLICATION_CREDENTIALS': os.getenv('GOOGLE_APPLICATION_CREDENTIALS'),
    'SUPABASE_URL': os.getenv('SUPABASE_URL'),
    'SUPABASE_SERVICE_KEY': os.getenv('SUPABASE_SERVICE_KEY')
}

for key, value in env_vars.items():
    if value:
        display_value = value[:20] + "..." if len(value) > 20 else value
        print(f"✅ {key}: {display_value}")
    else:
        print(f"❌ {key}: NOT SET")

# Test 2: Check Google Cloud credentials file
print("\n2. Checking Google Cloud Credentials File...")
print("-" * 60)

creds_path = env_vars['GOOGLE_APPLICATION_CREDENTIALS'] or './google-credentials.json'
if os.path.exists(creds_path):
    print(f"✅ Credentials file exists: {creds_path}")
    file_size = os.path.getsize(creds_path)
    print(f"   File size: {file_size} bytes")
else:
    print(f"❌ Credentials file NOT FOUND: {creds_path}")

# Test 3: Test Gemini API
print("\n3. Testing Gemini API Connection...")
print("-" * 60)

try:
    import google.generativeai as genai
    
    api_key = env_vars['GEMINI_API_KEY']
    if api_key:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.0-flash-exp')
        print("✅ Gemini API: Connected successfully")
        print(f"   Model: gemini-2.0-flash-exp")
    else:
        print("❌ Gemini API: API key not set")
except ImportError:
    print("❌ Gemini API: google-generativeai package not installed")
    print("   Run: pip install google-generativeai")
except Exception as e:
    print(f"❌ Gemini API: Error - {e}")

# Test 4: Test Google Cloud Speech-to-Text
print("\n4. Testing Google Cloud Speech-to-Text...")
print("-" * 60)

try:
    from google.cloud import speech_v1p1beta1 as speech
    
    client = speech.SpeechClient()
    print("✅ Google Cloud Speech-to-Text: Connected successfully")
    print(f"   Project: assignment-28a79")
    print(f"   Service Account: arogyaai@assignment-28a79.iam.gserviceaccount.com")
except ImportError:
    print("❌ Google Cloud Speech: google-cloud-speech package not installed")
    print("   Run: pip install google-cloud-speech")
except Exception as e:
    print(f"❌ Google Cloud Speech: Error - {e}")
    print("   Make sure Speech-to-Text API is enabled in Google Cloud Console")

# Test 5: Check required packages
print("\n5. Checking Required Python Packages...")
print("-" * 60)

required_packages = {
    'fastapi': 'FastAPI',
    'google.generativeai': 'Gemini AI',
    'google.cloud.speech': 'Google Cloud Speech',
    'supabase': 'Supabase Client'
}

for package, name in required_packages.items():
    try:
        __import__(package)
        print(f"✅ {name}: Installed")
    except ImportError:
        print(f"❌ {name}: NOT installed")
        if package == 'google.generativeai':
            print(f"   Run: pip install google-generativeai")
        elif package == 'google.cloud.speech':
            print(f"   Run: pip install google-cloud-speech")
        elif package == 'supabase':
            print(f"   Run: pip install supabase")

# Summary
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

all_good = True

if not env_vars['GEMINI_API_KEY']:
    print("❌ Gemini API key is missing")
    all_good = False

if not os.path.exists(creds_path):
    print("❌ Google Cloud credentials file is missing")
    all_good = False

try:
    import google.generativeai
    import google.cloud.speech
except ImportError:
    print("❌ Some required packages are not installed")
    all_good = False

if all_good:
    print("✅ ALL CHECKS PASSED!")
    print("\n🎉 Voice Intake feature is ready to use!")
    print("\nNext steps:")
    print("1. Start backend: python run.py")
    print("2. Start frontend: cd ../frontend && npm run dev")
    print("3. Login as patient and go to Voice Intake page")
else:
    print("❌ SOME CHECKS FAILED")
    print("\nPlease fix the issues above and run this test again.")

print("=" * 60)
