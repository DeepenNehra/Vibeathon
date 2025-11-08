"""
Test script for audio format detection.

This script tests the audio format detection functionality with various
audio formats that might be received from MediaRecorder in the browser.
"""

import sys
import os
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.stt_pipeline import STTPipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def create_test_audio_chunks():
    """Create test audio chunks with different format signatures."""
    
    test_chunks = {
        'webm_opus': b'\x1a\x45\xdf\xa3' + b'\x00' * 100,  # WebM signature
        'ogg_opus': b'OggS' + b'\x00' * 100,  # OGG signature
        'wav': b'RIFF' + b'\x00\x00\x00\x00' + b'WAVE' + b'\x00' * 16 + b'\x80\x3e\x00\x00' + b'\x00' * 100,  # WAV with 16kHz
        'flac': b'fLaC' + b'\x00' * 100,  # FLAC signature
        'pcm': b'\x00' * 16000,  # Raw PCM (16000 bytes = 1 second at 16kHz mono 16-bit)
        'unknown': b'\xff\xfe\xfd\xfc' + b'\x00' * 100,  # Unknown format
    }
    
    return test_chunks


def test_format_detection():
    """Test audio format detection with various formats."""
    
    logger.info("=" * 80)
    logger.info("AUDIO FORMAT DETECTION TEST")
    logger.info("=" * 80)
    
    # Initialize STT pipeline
    pipeline = STTPipeline()
    
    # Get test audio chunks
    test_chunks = create_test_audio_chunks()
    
    results = []
    
    for format_name, audio_chunk in test_chunks.items():
        logger.info("")
        logger.info(f"Testing format: {format_name.upper()}")
        logger.info("-" * 80)
        
        try:
            detected_format, needs_conversion, sample_rate = pipeline._detect_audio_format(audio_chunk)
            
            result = {
                'test_format': format_name,
                'detected_format': detected_format,
                'needs_conversion': needs_conversion,
                'sample_rate': sample_rate,
                'chunk_size': len(audio_chunk),
                'success': True
            }
            
            logger.info(f"✅ Detection successful:")
            logger.info(f"   Detected format: {detected_format}")
            logger.info(f"   Needs conversion: {needs_conversion}")
            logger.info(f"   Sample rate: {sample_rate} Hz")
            logger.info(f"   Chunk size: {len(audio_chunk)} bytes")
            
        except Exception as e:
            result = {
                'test_format': format_name,
                'error': str(e),
                'success': False
            }
            
            logger.error(f"❌ Detection failed: {e}")
        
        results.append(result)
    
    # Summary
    logger.info("")
    logger.info("=" * 80)
    logger.info("TEST SUMMARY")
    logger.info("=" * 80)
    
    successful = sum(1 for r in results if r['success'])
    total = len(results)
    
    logger.info(f"Total tests: {total}")
    logger.info(f"Successful: {successful}")
    logger.info(f"Failed: {total - successful}")
    logger.info("")
    
    for result in results:
        if result['success']:
            logger.info(f"✅ {result['test_format']:15} -> {result['detected_format']:10} | "
                       f"Convert: {str(result['needs_conversion']):5} | "
                       f"Rate: {result['sample_rate']} Hz")
        else:
            logger.info(f"❌ {result['test_format']:15} -> ERROR: {result['error']}")
    
    logger.info("")
    logger.info("=" * 80)
    
    return results


if __name__ == "__main__":
    logger.info("Starting audio format detection test...")
    logger.info("")
    
    results = test_format_detection()
    
    # Exit with appropriate code
    failed = sum(1 for r in results if not r['success'])
    sys.exit(0 if failed == 0 else 1)
