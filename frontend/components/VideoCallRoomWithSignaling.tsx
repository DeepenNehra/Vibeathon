'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeft, Subtitles, FileText, RefreshCw } from 'lucide-react'
import LiveCaptions from './LiveCaptions'

interface VideoCallRoomProps {
  consultationId: string
  userType: 'doctor' | 'patient'
}

export default function VideoCallRoomWithSignaling({ consultationId, userType }: VideoCallRoomProps) {
  const router = useRouter()
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  
  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const signalingWsRef = useRef<WebSocket | null>(null)
  const hasCreatedOfferRef = useRef(false) // Prevent duplicate offers
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]) // Queue ICE candidates if WS not ready
  const isInitializedRef = useRef(false) // Prevent double initialization in React Strict Mode
  const cleanupDoneRef = useRef(false) // Track if cleanup has been done
  
  // State
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null)
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  const wsUrl = backendUrl.replace('http', 'ws')

  // Check camera availability
  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      setCameraAvailable(cameras.length > 0)
      return cameras.length > 0
    } catch (err) {
      console.error('Error checking camera availability:', err)
      setCameraAvailable(false)
      return false
    }
  }

  useEffect(() => {
    // Check camera on mount
    checkCameraAvailability()
  }, [])

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitializedRef.current) {
      console.log('⚠️ Already initialized, skipping...')
      return
    }
    
    isInitializedRef.current = true
    cleanupDoneRef.current = false
    console.log('🚀 Initializing video call...')
    initializeCall()
    
    return () => {
      if (!cleanupDoneRef.current) {
        console.log('🧹 Cleaning up...')
        cleanup()
        cleanupDoneRef.current = true
        isInitializedRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId, userType])

  const initializeCall = async () => {
    // Prevent multiple initializations
    if (signalingWsRef.current?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket already connected, skipping initialization')
      return
    }
    
    // Clean up any existing connections first
    if (signalingWsRef.current) {
      console.log('🧹 Cleaning up existing WebSocket connection')
      signalingWsRef.current.close()
      signalingWsRef.current = null
    }
    
    if (peerConnectionRef.current) {
      console.log('🧹 Cleaning up existing peer connection')
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    try {
      // 1. Get local media with better error handling
      let stream: MediaStream
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
      } catch (mediaError: any) {
        // Handle specific media errors
        let errorMessage = 'Failed to access camera/microphone'
        
        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          errorMessage = 'Camera/microphone access denied. Please grant permissions in your browser settings and refresh the page.'
          toast.error(errorMessage, { duration: 5000 })
        } else if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera or microphone found. Please connect a device and refresh the page.'
          toast.error(errorMessage, { duration: 5000 })
        } else if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
          errorMessage = 'Camera/microphone is already in use by another application. Please close other apps using the camera and try again.'
          setMediaError(errorMessage)
          toast.error(errorMessage, { duration: 8000 })
        } else if (mediaError.name === 'OverconstrainedError') {
          errorMessage = 'Camera does not support the requested settings. Trying with default settings...'
          toast.warning(errorMessage)
          // Retry with simpler constraints
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            })
          } catch (retryError: any) {
            console.error('Retry also failed:', retryError)
            throw retryError
          }
        } else {
          errorMessage = `Media access error: ${mediaError.message || mediaError.name}`
          toast.error(errorMessage, { duration: 5000 })
        }
        
        console.error('❌ Media access error:', {
          name: mediaError.name,
          message: mediaError.message,
          constraint: mediaError.constraint
        })
        
        setIsConnecting(false)
        setMediaError(errorMessage)
        throw mediaError
      }
      
      localStreamRef.current = stream
      setLocalStream(stream) // Update state for LiveCaptions component
      setMediaError(null) // Clear any previous errors
      
      if (localVideoRef.current) {
        // Only set srcObject if it's different to avoid interrupting playback
        if (localVideoRef.current.srcObject !== stream) {
          localVideoRef.current.srcObject = stream
        }
        
        // Ensure local video plays with proper error handling
        const playPromise = localVideoRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Local video playing')
            })
            .catch(err => {
              // AbortError is usually harmless - it means play() was interrupted
              // This can happen during React re-renders or when srcObject changes
              if (err.name === 'AbortError') {
                console.log('ℹ️ Video play() was interrupted (this is usually harmless)')
                // Try playing again after a short delay
                setTimeout(() => {
                  if (localVideoRef.current && localVideoRef.current.srcObject === stream) {
                    localVideoRef.current.play().catch(() => {
                      // Ignore errors on retry
                    })
                  }
                }, 100)
              } else {
                console.error('Error playing local video:', err)
              }
            })
        }
      }
      
      console.log('✅ Local media obtained', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      })
      
      // 2. Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })
      
      peerConnectionRef.current = pc
      
      // 3. Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })
      
      // 4. Handle remote stream
      pc.ontrack = (event) => {
        console.log('📹 Received remote track', {
          streams: event.streams.length,
          track: event.track.kind,
          id: event.track.id
        })
        if (event.streams[0]) {
          const remoteStream = event.streams[0]
          
          // Wait for video element to be ready
          const setRemoteVideo = () => {
            if (remoteVideoRef.current) {
              // Only set srcObject if it's different to avoid interrupting playback
              if (remoteVideoRef.current.srcObject !== remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream
              }
              
              // CRITICAL: Ensure remote video plays with proper error handling
              const playPromise = remoteVideoRef.current.play()
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('✅ Remote video playing')
                    setIsConnected(true)
                    toast.success('Connected to peer!')
                  })
                  .catch(err => {
                    // AbortError is usually harmless - it means play() was interrupted
                    if (err.name === 'AbortError') {
                      console.log('ℹ️ Remote video play() was interrupted (this is usually harmless)')
                      // Try playing again after a short delay
                      setTimeout(() => {
                        if (remoteVideoRef.current && remoteVideoRef.current.srcObject === remoteStream) {
                          remoteVideoRef.current.play()
                            .then(() => {
                              console.log('✅ Remote video playing after retry')
                              setIsConnected(true)
                            })
                            .catch(() => {
                              // Ignore errors on retry
                            })
                        }
                      }, 100)
                    } else {
                      console.error('❌ Error playing remote video:', err)
                      // Only show error toast for non-AbortError cases
                      if (err.name !== 'NotAllowedError') {
                        toast.error('Failed to play remote video')
                      }
                    }
                  })
              }
            } else {
              // Retry if video element not ready yet
              setTimeout(setRemoteVideo, 100)
            }
          }
          
          setRemoteVideo()
        }
      }
      
      // 5. Handle connection state
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState
        console.log('🔗 Connection state:', state)
        if (state === 'connected') {
          setIsConnected(true)
          setIsConnecting(false)
          toast.success('Video call connected!')
        } else if (state === 'failed') {
          console.error('❌ Connection failed - attempting to restart ICE')
          toast.error('Connection failed. Trying to reconnect...')
          setIsConnecting(false)
          // Try to restart ICE
          try {
            pc.restartIce()
          } catch (err) {
            console.error('Error calling restartIce:', err)
          }
        } else if (state === 'disconnected') {
          toast.warning('Peer disconnected')
          setIsConnected(false)
        } else if (state === 'connecting') {
          setIsConnecting(true)
        }
      }
      
      // 5b. Handle ICE connection state (more detailed)
      pc.oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState
        console.log('🧊 ICE connection state:', iceState)
        if (iceState === 'failed') {
          console.error('❌ ICE connection failed')
          toast.error('Network connection failed. Check your internet.')
        } else if (iceState === 'connected' || iceState === 'completed') {
          console.log('✅ ICE connection established')
        }
      }
      
      // 5c. Monitor ICE gathering state
      pc.onicegatheringstatechange = () => {
        console.log('🧊 ICE gathering state:', pc.iceGatheringState)
      }
      
      // 6. Handle ICE candidates
      pc.onicecandidate = (event) => {
        const ws = signalingWsRef.current
        
        if (event.candidate) {
          // Queue candidate if WebSocket not ready
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.log('🧊 Queueing ICE candidate (WS not ready)')
            iceCandidateQueueRef.current.push(event.candidate)
            return
          }
          
          // Send candidate immediately if WebSocket is ready
          try {
            console.log('🧊 Sending ICE candidate:', event.candidate.candidate.substring(0, 50))
            ws.send(JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate
            }))
          } catch (err) {
            console.error('❌ Error sending ICE candidate:', err)
            // Queue it for later
            iceCandidateQueueRef.current.push(event.candidate)
          }
        } else {
          // null candidate means end of candidates
          console.log('🧊 ICE candidate gathering complete')
          if (ws && ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: null
              }))
            } catch (err) {
              console.error('❌ Error sending end-of-candidates:', err)
            }
          }
        }
      }
      
      // 7. Connect to signaling server
      // Close any existing connection first
      if (signalingWsRef.current !== null) {
        console.log('🧹 Closing existing signaling WebSocket')
        const ws: WebSocket = signalingWsRef.current
        try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close()
          }
        } catch (err) {
          console.error('Error closing existing WebSocket:', err)
        }
        signalingWsRef.current = null
      }
      
      // Construct WebSocket URL
      const wsSignalingUrl = `${wsUrl}/ws/signaling/${consultationId}/${userType}`
      console.log(`🔌 Connecting to signaling server: ${wsSignalingUrl}`)
      
      // Validate WebSocket URL
      if (!wsUrl || wsUrl === 'ws://undefined' || wsUrl === 'wss://undefined') {
        const errorMsg = `Invalid WebSocket URL: ${wsUrl}. Check NEXT_PUBLIC_BACKEND_URL environment variable.`
        console.error('❌', errorMsg)
        toast.error('Configuration error: Backend URL not set')
        setIsConnecting(false)
        return
      }
      
      let signalingWs: WebSocket
      try {
        signalingWs = new WebSocket(wsSignalingUrl)
        signalingWsRef.current = signalingWs
      } catch (err) {
        const errorMsg = `Failed to create WebSocket connection: ${err instanceof Error ? err.message : String(err)}`
        console.error('❌', errorMsg)
        toast.error('Failed to connect to signaling server')
        setIsConnecting(false)
        return
      }
      
      // Store URL for error handling
      const wsUrlForError = wsSignalingUrl
      
      signalingWs.onopen = () => {
        console.log('✅ Signaling connected as', userType)
        toast.success('Signaling server connected')
        
        // Send any queued ICE candidates
        const queue = iceCandidateQueueRef.current
        if (queue.length > 0) {
          console.log(`📤 Sending ${queue.length} queued ICE candidates`)
          queue.forEach(candidate => {
            try {
              signalingWs.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: candidate
              }))
            } catch (err) {
              console.error('❌ Error sending queued ICE candidate:', err)
            }
          })
          iceCandidateQueueRef.current = []
        }
        
        // Fallback: If doctor and we haven't created offer yet, try after a delay
        // This handles the case where both users connect at the same time
        if (userType === 'doctor' && !hasCreatedOfferRef.current) {
          console.log('⏰ Doctor connected, will attempt to create offer in 3 seconds if no patient join message received')
          setTimeout(() => {
            const pc = peerConnectionRef.current
            if (!hasCreatedOfferRef.current && pc && signalingWs.readyState === WebSocket.OPEN) {
              console.log('🔄 Fallback: Doctor creating offer (no patient join message received)')
              hasCreatedOfferRef.current = true
              createOffer()
            }
          }, 3000)
        }
      }
      
      signalingWs.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📨 Signaling message received:', message.type, message)
          
          switch (message.type) {
            case 'offer':
              console.log('📥 Received OFFER message')
              await handleOffer(message.offer)
              break
            case 'answer':
              console.log('📥 Received ANSWER message')
              await handleAnswer(message.answer)
              break
            case 'ice-candidate':
              console.log('🧊 Received ICE candidate')
              await handleIceCandidate(message.candidate)
              break
            case 'user-joined':
              console.log(`👤 ${message.userType} joined (${message.totalUsers} total)`, {
                currentUser: userType,
                joinedUser: message.userType,
                totalUsers: message.totalUsers
              })
              
              // Only create offer once when patient joins (doctor's perspective)
              if (userType === 'doctor' && message.userType === 'patient' && !hasCreatedOfferRef.current) {
                hasCreatedOfferRef.current = true
                console.log('🎬 Patient joined, doctor creating offer...')
                // Wait a bit to ensure both peers are ready
                setTimeout(() => {
                  createOffer()
                }, 1500)
              }
              
              // If patient sees doctor joined, they should wait for offer
              if (userType === 'patient' && message.userType === 'doctor') {
                console.log('👨‍⚕️ Doctor joined, waiting for offer...')
              }
              
              // Debug: Log if we see our own join message (shouldn't happen)
              if (userType === message.userType) {
                console.warn('⚠️ Received own join message - this might indicate a signaling issue')
              }
              break
            default:
              console.warn('⚠️ Unknown message type:', message.type)
          }
        } catch (err) {
          console.error('❌ Error processing signaling message:', err)
        }
      }
      
      signalingWs.onerror = (error) => {
        // WebSocket error events don't always have detailed error info
        const errorDetails = {
          readyState: signalingWs.readyState,
          url: wsUrlForError,
          readyStateText: signalingWs.readyState === WebSocket.CONNECTING ? 'CONNECTING' :
                         signalingWs.readyState === WebSocket.OPEN ? 'OPEN' :
                         signalingWs.readyState === WebSocket.CLOSING ? 'CLOSING' :
                         signalingWs.readyState === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN'
        }
        console.error('❌ Signaling WebSocket error:', errorDetails)
        
        // Provide more helpful error message
        if (signalingWs.readyState === WebSocket.CLOSED) {
          toast.error('Signaling server connection failed. Check if backend is running.')
        } else {
          toast.error('Signaling connection error. Please refresh the page.')
        }
        
        setIsConnecting(false)
      }
      
      signalingWs.onclose = (event) => {
        const closeDetails = {
          code: event.code,
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean
        }
        console.log('🔌 Signaling disconnected:', closeDetails)
        
        // Only show error toast if it wasn't a clean close
        if (!event.wasClean && event.code !== 1000) {
          if (event.code === 1006) {
            toast.error('Signaling connection lost. Check network connection.')
          } else {
            toast.warning('Signaling connection closed unexpectedly')
          }
        }
        
        setIsConnected(false)
      }
      
      setIsConnecting(false)
      
    } catch (err: any) {
      console.error('❌ Error initializing call:', err)
      
      // Don't show duplicate error messages (already shown in media access error handling)
      if (err?.name !== 'NotAllowedError' && 
          err?.name !== 'NotFoundError' && 
          err?.name !== 'NotReadableError' &&
          err?.name !== 'TrackStartError' &&
          err?.name !== 'OverconstrainedError') {
        toast.error('Failed to initialize video call. Please refresh the page.')
      }
      
      setIsConnecting(false)
    }
  }

  const createOffer = async () => {
    const pc = peerConnectionRef.current
    const ws = signalingWsRef.current
    
    console.log('🔍 createOffer called', {
      hasPC: !!pc,
      hasWS: !!ws,
      wsState: ws?.readyState,
      hasCreatedOffer: hasCreatedOfferRef.current
    })
    
    if (!pc) {
      console.error('❌ No peer connection')
      return
    }
    if (!ws) {
      console.error('❌ No signaling WebSocket')
      return
    }
    if (ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not open, state:', ws.readyState)
      return
    }
    
    try {
      console.log('📤 Creating offer...')
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      console.log('✅ Offer created:', offer.type)
      
      await pc.setLocalDescription(offer)
      console.log('✅ Local description set')
      
      const offerMessage = {
        type: 'offer',
        offer: offer
      }
      
      ws.send(JSON.stringify(offerMessage))
      console.log('✅ Offer sent successfully via WebSocket')
      toast.success('Call initiated')
    } catch (err) {
      console.error('❌ Error creating offer:', err)
      if (err instanceof Error) {
        console.error('Error details:', err.message, err.stack)
      }
      toast.error('Failed to initiate call')
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current
    const ws = signalingWsRef.current
    
    if (!pc) {
      console.error('❌ No peer connection when handling offer')
      return
    }
    if (!ws) {
      console.error('❌ No signaling WebSocket when handling offer')
      return
    }
    
    try {
      console.log('📥 Received offer, creating answer...')
      toast.info('Received call, connecting...')
      
      // Set remote description first
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      console.log('✅ Remote description set')
      
      // Create and set local description (answer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      console.log('✅ Local description (answer) set')
      
      // Send answer
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'answer',
          answer: answer
        }))
        console.log('✅ Answer sent successfully')
        toast.success('Answered call')
      } else {
        console.error('❌ WebSocket not open when trying to send answer')
        toast.error('Connection lost, please refresh')
      }
    } catch (err) {
      console.error('❌ Error handling offer:', err)
      toast.error('Failed to answer call')
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current
    
    if (!pc) {
      console.error('❌ No peer connection when handling answer')
      return
    }
    
    try {
      console.log('📥 Received answer')
      
      // Check if we already have a remote description
      if (pc.remoteDescription) {
        console.log('⚠️ Remote description already set, updating...')
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
      console.log('✅ Answer applied, connection should establish')
      toast.success('Call answered, connecting...')
    } catch (err) {
      console.error('❌ Error handling answer:', err)
      if (err instanceof Error) {
        console.error('Error details:', err.message, err.stack)
      }
      toast.error('Failed to process answer')
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit | null) => {
    const pc = peerConnectionRef.current
    
    if (!pc) {
      console.error('❌ No peer connection when handling ICE candidate')
      return
    }
    
    // null candidate means end of candidates
    if (!candidate) {
      console.log('🧊 Received end-of-candidates signal')
      return
    }
    
    try {
      // Check if remote description is set
      if (!pc.remoteDescription) {
        console.log('⏳ Queueing ICE candidate (no remote description yet)')
        // Queue it - will be added after remote description is set
        setTimeout(() => handleIceCandidate(candidate), 100)
        return
      }
      
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('✅ ICE candidate added:', candidate.candidate?.substring(0, 50))
    } catch (err) {
      console.error('❌ Error adding ICE candidate:', err)
      // If error is because remote description not set, retry
      if (err instanceof Error && err.message.includes('remoteDescription')) {
        console.log('⏳ Retrying ICE candidate after remote description is set')
        setTimeout(() => handleIceCandidate(candidate), 200)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  const cleanup = () => {
    console.log('🧹 Starting cleanup...')
    cleanupDoneRef.current = true
    
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('🛑 Stopped track:', track.kind)
      })
      localStreamRef.current = null
      setLocalStream(null) // Clear state
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
      console.log('🛑 Closed peer connection')
    }
    
    // Close WebSocket
    if (signalingWsRef.current) {
      if (signalingWsRef.current.readyState === WebSocket.OPEN || 
          signalingWsRef.current.readyState === WebSocket.CONNECTING) {
        signalingWsRef.current.close()
        console.log('🛑 Closed signaling WebSocket')
      }
      signalingWsRef.current = null
    }
    
    // Reset flags
    hasCreatedOfferRef.current = false
    iceCandidateQueueRef.current = []
    console.log('✅ Cleanup complete')
  }

  const retryMediaAccess = async () => {
    setMediaError(null)
    setIsConnecting(true)
    
    // Clean up any existing stream first
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
      setLocalStream(null)
    }
    
    // Wait a moment for resources to be released
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Retry initialization
    try {
      await initializeCall()
    } catch (err) {
      console.error('Retry failed:', err)
    }
  }

  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false)

  const generateSoapNotes = async () => {
    if (!consultationId) {
      toast.error('Consultation ID not found')
      return
    }

    try {
      setIsGeneratingSoap(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      const response = await fetch(`${backendUrl}/api/consultations/${consultationId}/generate_soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to generate SOAP notes' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      toast.success('SOAP notes generated successfully!')
      
      // Navigate to review page to see the generated notes
      router.push(`/consultation/${consultationId}/review`)
    } catch (error) {
      console.error('Error generating SOAP notes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate SOAP notes'
      toast.error(errorMessage)
    } finally {
      setIsGeneratingSoap(false)
    }
  }

  const endCall = () => {
    cleanup()
    router.push(userType === 'doctor' ? '/doctor/appointments' : '/patient/appointments')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-white text-lg font-semibold">
              Video Consultation
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className="text-white text-sm">
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Waiting for peer'}
            </span>
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Media Error Alert */}
        {mediaError && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-red-200 font-semibold mb-2 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Camera/Microphone Error
                </h3>
                <p className="text-red-100 text-sm mb-3">{mediaError}</p>
                <div className="text-red-200 text-xs space-y-2">
                  <p><strong>Step-by-step fix:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li><strong>Close all video apps:</strong> Zoom, Teams, Skype, Discord</li>
                    <li><strong>Close other browser tabs</strong> with video calls (look for camera icon in tabs)</li>
                    <li><strong>Check browser permissions:</strong> Click lock icon (🔒) in address bar → Allow Camera & Microphone</li>
                    <li><strong>Check Windows settings:</strong> Win+I → Privacy → Camera → Enable all camera access</li>
                    <li><strong>Restart browser</strong> completely (close all windows, wait 5 seconds, reopen)</li>
                    <li><strong>Click "Retry"</strong> button below after completing steps above</li>
                  </ol>
                  <div className="mt-3 p-2 bg-red-800/30 rounded border border-red-700/50">
                    <p className="font-semibold mb-1">💡 Quick Tip:</p>
                    <p>Press <kbd className="px-1.5 py-0.5 bg-red-900/50 rounded text-xs">Ctrl + Shift + Esc</kbd> to open Task Manager and check for Zoom, Teams, or other video apps still running.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[140px]">
                <Button
                  onClick={retryMediaAccess}
                  variant="outline"
                  className="bg-red-800 hover:bg-red-700 text-white border-red-600"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Retrying...' : 'Retry Camera Access'}
                </Button>
                <Button
                  onClick={() => {
                    setMediaError(null)
                    window.location.reload()
                  }}
                  variant="ghost"
                  className="text-red-200 hover:text-red-100 hover:bg-red-800/50"
                  size="sm"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => {
                    // Open Windows Camera settings
                    window.open('ms-settings:privacy-webcam', '_blank')
                  }}
                  variant="ghost"
                  className="text-red-200 hover:text-red-100 hover:bg-red-800/50 text-xs"
                  size="sm"
                  title="Open Windows Camera Privacy Settings"
                >
                  Windows Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Remote Video */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0 aspect-video bg-slate-900 relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8" />
                    </div>
                    <p>Waiting for {userType === 'doctor' ? 'patient' : 'doctor'}...</p>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded-lg">
                <span className="text-white text-sm">
                  {userType === 'doctor' ? 'Patient' : 'Doctor'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Local Video */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0 aspect-video bg-slate-900 relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded-lg">
                <span className="text-white text-sm">You</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={toggleVideo}
                variant="outline"
                size="lg"
                className={`${isVideoOn ? 'bg-slate-700' : 'bg-red-500'} text-white border-slate-600`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                onClick={toggleAudio}
                variant="outline"
                size="lg"
                className={`${isAudioOn ? 'bg-slate-700' : 'bg-red-500'} text-white border-slate-600`}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                variant="outline"
                size="lg"
                className={`${captionsEnabled ? 'bg-blue-600' : 'bg-slate-700'} text-white border-slate-600`}
                title={captionsEnabled ? 'Disable Captions' : 'Enable Captions'}
              >
                <Subtitles className="w-5 h-5" />
              </Button>

              {userType === 'doctor' && (
                <Button
                  onClick={generateSoapNotes}
                  variant="outline"
                  size="lg"
                  disabled={isGeneratingSoap}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600 disabled:opacity-50"
                  title="Generate SOAP Notes"
                >
                  {isGeneratingSoap ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Generate SOAP
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="bg-red-500 hover:bg-red-600"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                End Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Live Captions */}
      {captionsEnabled && localStream && (
        <LiveCaptions
          consultationId={consultationId}
          userType={userType}
          localStream={localStream}
          enabled={captionsEnabled}
          onToggle={() => setCaptionsEnabled(false)}
        />
      )}
    </div>
  )
}
