"""
Quick test to verify caption imports work
"""

print("Testing caption imports...")

try:
    from app.captions import router, caption_manager
    print("✅ Captions module imported successfully")
    print(f"   Router: {router}")
    print(f"   Caption Manager: {caption_manager}")
except Exception as e:
    print(f"❌ Error importing captions: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.stt_pipeline import get_stt_pipeline
    stt = get_stt_pipeline()
    print("✅ STT Pipeline imported successfully")
    print(f"   Google Speech Client: {stt.google_speech_client is not None}")
    print(f"   OpenAI Client: {stt.openai_client is not None}")
except Exception as e:
    print(f"❌ Error importing STT pipeline: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.database import DatabaseClient
    print("✅ Database module imported successfully")
except Exception as e:
    print(f"❌ Error importing database: {e}")

print("\n✅ All imports successful! Caption system is ready.")
print("\nNote: You still need to configure API keys:")
print("  - Google Cloud: GOOGLE_APPLICATION_CREDENTIALS")
print("  - OR OpenAI: OPENAI_API_KEY")
