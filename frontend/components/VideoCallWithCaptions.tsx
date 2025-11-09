'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Subtitles } from 'lucide-react'
import VideoCallRoom from './VideoCallRoom'
import LiveCaptions from './LiveCaptions'
import LiveCaptionsWebSpeech from './LiveCaptionsWebSpeech'

interface VideoCallWithCaptionsProps {
  consultationId: string
  userType: 'doctor' | 'patient'
}

export interface VideoCallRoomHandle {
  getLocalStream: () => MediaStream | null
}

export default function VideoCallWithCaptions({
  consultationId,
  userType
}: VideoCallWithCaptionsProps) {
  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const videoCallRoomRef = useRef<VideoCallRoomHandle>(null)

  useEffect(() => {
    const checkStream = () => {
      if (videoCallRoomRef.current) {
        const stream = videoCallRoomRef.current.getLocalStream()
        if (stream && stream.getAudioTracks().length > 0) {
          setLocalStream(stream)
        } else {
          // Retry after a delay if stream isn't ready
          setTimeout(checkStream, 500)
        }
      }
    }

    if (captionsEnabled) {
      checkStream()
    }
  }, [captionsEnabled])

  return (
    <div className="relative">
      {/* Video Call Component */}
      <VideoCallRoom
        ref={videoCallRoomRef}
        consultationId={consultationId}
        userType={userType}
      />

      {/* Captions Toggle Button - Fixed Position */}
      <div className="fixed bottom-32 right-6 z-50">
        <Button
          onClick={() => setCaptionsEnabled(!captionsEnabled)}
          size="lg"
          className={`${
            captionsEnabled
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-slate-700 hover:bg-slate-600'
          } text-white shadow-lg`}
          title={captionsEnabled ? 'Disable Captions' : 'Enable Captions'}
        >
          <Subtitles className="w-5 h-5" />
        </Button>
      </div>

      {/* Live Captions Overlay */}
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
