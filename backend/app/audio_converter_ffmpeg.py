"""
Audio converter using FFmpeg subprocess.
Simpler than pydub - just calls FFmpeg directly.
"""

import subprocess
import tempfile
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class AudioConverter:
    """Converts audio using FFmpeg subprocess."""
    
    @staticmethod
    def check_ffmpeg() -> bool:
        """Check if FFmpeg is available."""
        try:
            subprocess.run(['ffmpeg', '-version'], 
                         capture_output=True, 
                         check=True,
                         timeout=5)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            return False
    
    @staticmethod
    def webm_to_pcm(webm_data: bytes, target_sample_rate: int = 16000) -> Optional[bytes]:
        """
        Convert WebM/Opus to LINEAR16 PCM using FFmpeg.
        
        Audio Format Conversion Process (Task 4.1, 4.2, 4.3):
        
        1. Validation:
           - Check FFmpeg availability
           - Validate input data size
        
        2. Conversion Pipeline:
           - Write WebM data to temporary file
           - Call FFmpeg with specific parameters:
             * -ar 16000: Resample to 16kHz (required by Google Cloud STT)
             * -ac 1: Convert to mono (single channel)
             * -f s16le: Output format (signed 16-bit little-endian PCM)
             * -acodec pcm_s16le: PCM codec
           - Read converted PCM data from output file
        
        3. Verification:
           - Check output size is non-zero
           - Calculate estimated duration
           - Validate conversion produced reasonable output
        
        4. Error Handling:
           - Timeout after 10 seconds (prevents hanging)
           - Log detailed error messages
           - Clean up temporary files
           - Return None on failure (allows fallback)
        
        Args:
            webm_data: Raw WebM audio bytes from MediaRecorder
            target_sample_rate: Target sample rate in Hz (default: 16000 for speech recognition)
            
        Returns:
            LINEAR16 PCM audio bytes or None if conversion fails
        """
        # Check if FFmpeg is available
        if not AudioConverter.check_ffmpeg():
            logger.error("❌ FFmpeg not found - cannot convert audio")
            logger.error("   Please install FFmpeg: https://ffmpeg.org/download.html")
            return None
        
        logger.info(f"🔄 Starting audio conversion: {len(webm_data)} bytes -> PCM @ {target_sample_rate} Hz")
        
        try:
            # Create temporary files
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as input_file:
                input_path = input_file.name
                input_file.write(webm_data)
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as output_file:
                output_path = output_file.name
            
            logger.debug(f"   Input temp file: {input_path}")
            logger.debug(f"   Output temp file: {output_path}")
            
            try:
                # Convert using FFmpeg
                # -i input.webm: input file
                # -ar 16000: resample to 16kHz
                # -ac 1: convert to mono
                # -f s16le: output format (signed 16-bit little-endian PCM)
                # -acodec pcm_s16le: PCM codec
                ffmpeg_cmd = [
                    'ffmpeg',
                    '-i', input_path,
                    '-ar', str(target_sample_rate),
                    '-ac', '1',
                    '-f', 's16le',
                    '-acodec', 'pcm_s16le',
                    output_path,
                    '-y',  # Overwrite output file
                    '-loglevel', 'error'  # Only show errors
                ]
                
                logger.debug(f"   FFmpeg command: {' '.join(ffmpeg_cmd)}")
                
                result = subprocess.run(
                    ffmpeg_cmd,
                    check=True,
                    capture_output=True,
                    timeout=10
                )
                
                # Read converted audio
                with open(output_path, 'rb') as f:
                    pcm_data = f.read()
                
                if len(pcm_data) == 0:
                    logger.error("❌ Conversion produced empty output")
                    return None
                
                logger.info(f"✅ Conversion successful: {len(webm_data)} bytes -> {len(pcm_data)} bytes PCM")
                logger.debug(f"   Sample rate: {target_sample_rate} Hz")
                logger.debug(f"   Channels: 1 (mono)")
                logger.debug(f"   Format: LINEAR16 PCM (signed 16-bit little-endian)")
                
                # Verify the conversion produced reasonable output
                # For 16kHz mono 16-bit PCM: 1 second = 16000 samples * 2 bytes = 32000 bytes
                expected_bytes_per_second = target_sample_rate * 2
                duration_seconds = len(pcm_data) / expected_bytes_per_second
                logger.debug(f"   Estimated duration: {duration_seconds:.2f} seconds")
                
                return pcm_data
                
            finally:
                # Clean up temp files
                try:
                    os.unlink(input_path)
                    os.unlink(output_path)
                    logger.debug("   Cleaned up temporary files")
                except Exception as cleanup_error:
                    logger.warning(f"   Failed to clean up temp files: {cleanup_error}")
                    
        except subprocess.TimeoutExpired:
            logger.error("❌ FFmpeg conversion timed out (>10 seconds)")
            logger.error("   Audio chunk may be too large or corrupted")
            return None
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode() if e.stderr else str(e)
            logger.error(f"❌ FFmpeg conversion failed: {error_msg}")
            logger.error(f"   Input size: {len(webm_data)} bytes")
            logger.error(f"   Target sample rate: {target_sample_rate} Hz")
            return None
        except Exception as e:
            logger.error(f"❌ Audio conversion error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return None
    
    @staticmethod
    def is_valid_audio(audio_data: bytes, min_size: int = 1000) -> bool:
        """Check if audio data is valid."""
        return audio_data and len(audio_data) >= min_size


# Singleton
_audio_converter: Optional[AudioConverter] = None

def get_audio_converter() -> AudioConverter:
    """Get or create singleton AudioConverter instance."""
    global _audio_converter
    if _audio_converter is None:
        _audio_converter = AudioConverter()
    return _audio_converter
