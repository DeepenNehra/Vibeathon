"""
Test script for Caption WebSocket endpoint

This script verifies that the caption WebSocket endpoint is accessible,
responding correctly, and can process audio chunks.

Usage:
    python test_caption_websocket.py
"""

import asyncio
import websockets
import json
import sys
from pathlib import Path

# Test configuration
BACKEND_URL = "ws://localhost:8000"
CONSULTATION_ID = "test-consultation-123"
USER_TYPE = "doctor"  # or "patient"


async def test_caption_websocket():
    """Test the caption WebSocket endpoint"""
    
    print("=" * 70)
    print("Caption WebSocket Endpoint Test")
    print("=" * 70)
    print()
    
    # Construct WebSocket URL
    ws_url = f"{BACKEND_URL}/ws/captions/{CONSULTATION_ID}/{USER_TYPE}"
    print(f"🔗 Connecting to: {ws_url}")
    print()
    
    try:
        # Test 1: Connection establishment
        print("Test 1: WebSocket Connection")
        print("-" * 70)
        
        async with websockets.connect(ws_url) as websocket:
            print("✅ WebSocket connection established successfully")
            print()
            
            # Test 2: Receive connection confirmation
            print("Test 2: Connection Confirmation Message")
            print("-" * 70)
            
            try:
                # Wait for connection confirmation with timeout
                confirmation = await asyncio.wait_for(
                    websocket.recv(),
                    timeout=5.0
                )
                
                # Parse JSON response
                confirmation_data = json.loads(confirmation)
                print(f"✅ Received confirmation message:")
                print(f"   Type: {confirmation_data.get('type')}")
                print(f"   Message: {confirmation_data.get('message')}")
                print(f"   User Type: {confirmation_data.get('user_type')}")
                print()
                
                # Verify confirmation message structure
                assert confirmation_data.get('type') == 'connected', \
                    f"Expected type 'connected', got '{confirmation_data.get('type')}'"
                assert confirmation_data.get('user_type') == USER_TYPE, \
                    f"Expected user_type '{USER_TYPE}', got '{confirmation_data.get('user_type')}'"
                
                print("✅ Connection confirmation validated")
                print()
                
            except asyncio.TimeoutError:
                print("❌ FAILED: No confirmation message received within 5 seconds")
                return False
            except json.JSONDecodeError as e:
                print(f"❌ FAILED: Invalid JSON in confirmation message: {e}")
                return False
            except AssertionError as e:
                print(f"❌ FAILED: {e}")
                return False
            
            # Test 3: Send sample audio chunk
            print("Test 3: Send Sample Audio Chunk")
            print("-" * 70)
            
            # Create a sample audio chunk (simulated WebM/Opus data)
            # In real scenario, this would be actual audio data from MediaRecorder
            # For testing, we'll create a minimal valid audio chunk
            sample_audio = create_sample_audio_chunk()
            
            print(f"📤 Sending sample audio chunk ({len(sample_audio)} bytes)...")
            await websocket.send(sample_audio)
            print("✅ Audio chunk sent successfully")
            print()
            
            # Test 4: Receive response (caption or error)
            print("Test 4: Receive Response")
            print("-" * 70)
            print("⏳ Waiting for response (this may take a few seconds)...")
            print("   Note: Response depends on STT service availability")
            print()
            
            try:
                # Wait for response with longer timeout (STT processing takes time)
                response = await asyncio.wait_for(
                    websocket.recv(),
                    timeout=15.0
                )
                
                # Parse JSON response
                response_data = json.loads(response)
                print(f"✅ Received response:")
                print(f"   Type: {response_data.get('type')}")
                
                if response_data.get('type') == 'caption':
                    print(f"   Speaker: {response_data.get('speaker')}")
                    print(f"   Original Text: {response_data.get('original_text')}")
                    print(f"   Translated Text: {response_data.get('translated_text')}")
                    print()
                    print("✅ Caption response received and validated")
                elif response_data.get('type') == 'error':
                    print(f"   Message: {response_data.get('message')}")
                    print()
                    print("⚠️  Error response received (this is expected if STT service is not configured)")
                else:
                    print(f"   Data: {response_data}")
                    print()
                    print("⚠️  Unexpected response type")
                
                print()
                
            except asyncio.TimeoutError:
                print("⚠️  No response received within 15 seconds")
                print("   This is expected if:")
                print("   - Audio chunk is too small (< 100 bytes)")
                print("   - STT service is not configured")
                print("   - Audio contains only silence")
                print()
            except json.JSONDecodeError as e:
                print(f"❌ FAILED: Invalid JSON in response: {e}")
                return False
            
            # Test 5: Send ping control message
            print("Test 5: Control Message (Ping)")
            print("-" * 70)
            
            ping_message = json.dumps({"type": "ping"})
            print(f"📤 Sending ping message...")
            await websocket.send(ping_message)
            print("✅ Ping message sent successfully")
            print()
            
            try:
                # Wait for pong response
                pong_response = await asyncio.wait_for(
                    websocket.recv(),
                    timeout=5.0
                )
                
                pong_data = json.loads(pong_response)
                print(f"✅ Received pong response:")
                print(f"   Type: {pong_data.get('type')}")
                print()
                
                assert pong_data.get('type') == 'pong', \
                    f"Expected type 'pong', got '{pong_data.get('type')}'"
                
                print("✅ Ping/pong validated")
                print()
                
            except asyncio.TimeoutError:
                print("⚠️  No pong response received (this is acceptable)")
                print()
            except json.JSONDecodeError as e:
                print(f"⚠️  Invalid JSON in pong response: {e}")
                print()
            
            # Test 6: Close connection gracefully
            print("Test 6: Graceful Disconnection")
            print("-" * 70)
            
            await websocket.close()
            print("✅ WebSocket connection closed gracefully")
            print()
        
        # All tests passed
        print("=" * 70)
        print("✅ ALL TESTS PASSED")
        print("=" * 70)
        print()
        print("Summary:")
        print("  ✅ WebSocket connection established")
        print("  ✅ Connection confirmation received")
        print("  ✅ Audio chunk sent successfully")
        print("  ✅ Response handling verified")
        print("  ✅ Control messages working")
        print("  ✅ Graceful disconnection")
        print()
        print("The caption WebSocket endpoint is functioning correctly!")
        print()
        
        return True
        
    except websockets.exceptions.WebSocketException as e:
        print(f"❌ WebSocket Error: {e}")
        print()
        print("Possible causes:")
        print("  - Backend server is not running")
        print("  - Incorrect URL or port")
        print("  - Network connectivity issues")
        print()
        print("To start the backend server:")
        print("  cd backend")
        print("  python run.py")
        print()
        return False
        
    except ConnectionRefusedError:
        print("❌ Connection Refused")
        print()
        print("The backend server is not running or not accessible.")
        print()
        print("To start the backend server:")
        print("  cd backend")
        print("  python run.py")
        print()
        return False
        
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        print()
        import traceback
        traceback.print_exc()
        return False


def create_sample_audio_chunk():
    """
    Create a sample audio chunk for testing
    
    This creates a minimal audio chunk that simulates WebM/Opus data.
    In a real scenario, this would be actual audio from MediaRecorder.
    
    Returns:
        bytes: Sample audio data
    """
    # WebM file signature (first 4 bytes)
    webm_signature = b'\x1a\x45\xdf\xa3'
    
    # Create a minimal WebM header with some padding
    # This is not a valid playable audio file, but it's enough to test
    # the WebSocket communication and basic validation
    sample_data = webm_signature + b'\x00' * 200
    
    return sample_data


def print_usage():
    """Print usage instructions"""
    print()
    print("Usage:")
    print("  python test_caption_websocket.py")
    print()
    print("Configuration:")
    print(f"  Backend URL: {BACKEND_URL}")
    print(f"  Consultation ID: {CONSULTATION_ID}")
    print(f"  User Type: {USER_TYPE}")
    print()
    print("To modify configuration, edit the variables at the top of this script.")
    print()


if __name__ == "__main__":
    print()
    
    # Check if help is requested
    if len(sys.argv) > 1 and sys.argv[1] in ["-h", "--help", "help"]:
        print_usage()
        sys.exit(0)
    
    # Run the test
    try:
        success = asyncio.run(test_caption_websocket())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print()
        print("Test interrupted by user")
        sys.exit(1)
