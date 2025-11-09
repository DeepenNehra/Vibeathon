/**
 * Replit Configuration Helper for Arogya-AI
 * Handles environment detection and URL configuration for Replit deployment
 */

export const getReplitConfig = () => {
  // Check if running on Replit
  const isReplit = typeof process !== 'undefined' && 
                   (process.env.REPL_SLUG || process.env.REPLIT_DB_URL || 
                    typeof window !== 'undefined' && window.location.hostname.includes('repl.co'))
  
  // Get Repl information
  const replSlug = process.env.REPL_SLUG || process.env.NEXT_PUBLIC_REPL_SLUG
  const replOwner = process.env.REPL_OWNER || process.env.NEXT_PUBLIC_REPL_OWNER
  
  // Determine backend URL
  let backendUrl: string
  
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  } else if (isReplit && replSlug && replOwner) {
    backendUrl = `https://${replSlug}.${replOwner}.repl.co:8080`
  } else if (typeof window !== 'undefined' && window.location.hostname.includes('repl.co')) {
    // Extract from current URL if running in browser
    const hostname = window.location.hostname
    backendUrl = `https://${hostname}:8080`
  } else {
    backendUrl = 'http://localhost:8000'
  }
  
  // Determine frontend URL
  const frontendUrl = isReplit && replSlug && replOwner 
    ? `https://${replSlug}.${replOwner}.repl.co`
    : typeof window !== 'undefined' 
      ? window.location.origin
      : 'http://localhost:3000'
  
  return {
    isReplit,
    replSlug,
    replOwner,
    backendUrl,
    frontendUrl,
    // WebSocket URL (convert HTTP/HTTPS to WS/WSS)
    wsUrl: backendUrl.replace('https://', 'wss://').replace('http://', 'ws://')
  }
}

// WebRTC configuration optimized for Replit
export const replitWebRTCConfig: RTCConfiguration = {
  iceServers: [
    // Google STUN servers (free and reliable)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    
    // Additional STUN servers for better connectivity
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'balanced',
  rtcpMuxPolicy: 'require',
}

// Media constraints optimized for Replit and hackathon demos
export const replitMediaConstraints: MediaStreamConstraints = {
  video: {
    width: { ideal: 640, max: 1280 },
    height: { ideal: 480, max: 720 },
    frameRate: { ideal: 15, max: 30 },
    facingMode: 'user',
    // Additional constraints for better compatibility
    aspectRatio: { ideal: 4/3 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,  // Optimized for STT
    channelCount: 1,
    // Additional audio constraints
    latency: { ideal: 0.1 },
    volume: { ideal: 1.0 },
  }
}

// Screen sharing constraints for Replit
export const replitScreenShareConstraints: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 10, max: 15 }, // Lower framerate for screen sharing
  },
  audio: true
}

// Helper function to get WebSocket URL for different services
export const getWebSocketUrl = (service: 'captions' | 'signaling', consultationId: string, userType: string) => {
  const { wsUrl } = getReplitConfig()
  return `${wsUrl}/ws/${service}/${consultationId}/${userType}`
}

// Helper function to check if HTTPS is available (required for WebRTC)
export const isHTTPS = () => {
  if (typeof window === 'undefined') return false
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost'
}

// Helper function to show user-friendly error messages
export const getMediaErrorMessage = (error: DOMException) => {
  switch (error.name) {
    case 'NotAllowedError':
      return {
        title: 'Camera/Microphone Access Denied',
        message: 'Please allow camera and microphone access for video calls to work. Click the camera icon in your browser\'s address bar and select "Allow".',
        action: 'Grant Permissions'
      }
    case 'NotFoundError':
      return {
        title: 'No Camera or Microphone Found',
        message: 'Please connect your camera and microphone, then refresh the page.',
        action: 'Refresh Page'
      }
    case 'NotReadableError':
      return {
        title: 'Camera/Microphone Busy',
        message: 'Your camera or microphone is being used by another application. Please close other apps and try again.',
        action: 'Try Again'
      }
    case 'OverconstrainedError':
      return {
        title: 'Camera/Microphone Not Compatible',
        message: 'Your camera or microphone doesn\'t support the required settings. We\'ll try with basic settings.',
        action: 'Use Basic Settings'
      }
    case 'SecurityError':
      return {
        title: 'Security Error',
        message: 'Camera and microphone access requires HTTPS. Please open this app in a new tab (not preview).',
        action: 'Open in New Tab'
      }
    default:
      return {
        title: 'Media Access Error',
        message: `An error occurred: ${error.message}. Please check your camera and microphone settings.`,
        action: 'Try Again'
      }
  }
}

// Helper function for Replit-specific debugging
export const logReplitInfo = () => {
  const config = getReplitConfig()
  console.log('🔍 Replit Configuration:', {
    isReplit: config.isReplit,
    replSlug: config.replSlug,
    replOwner: config.replOwner,
    backendUrl: config.backendUrl,
    frontendUrl: config.frontendUrl,
    wsUrl: config.wsUrl,
    isHTTPS: isHTTPS(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
  })
}