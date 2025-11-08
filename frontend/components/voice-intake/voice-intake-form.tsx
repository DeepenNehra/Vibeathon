'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Mic, MicOff, Loader2, CheckCircle2, Languages, FileText } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface VoiceIntakeFormProps {
  patientId: string
}

interface ExtractedData {
  full_name: string | null
  age: number | null
  gender: string | null
  chief_complaint: string | null
  symptom_duration: string | null
  medical_history: string[]
  current_medications: string[]
  allergies: string[]
  previous_surgeries: string[]
  family_history: string | null
  lifestyle: {
    smoking: string
    alcohol: string
    exercise: string
  }
  additional_notes: string | null
  original_language: string
  original_transcript: string
  english_transcript: string
}

export function VoiceIntakeForm({ patientId }: VoiceIntakeFormProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN')
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const languages = [
    { code: 'hi-IN', name: 'Hindi (हिंदी)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'bn-IN', name: 'Bengali (বাংলা)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
    { code: 'mr-IN', name: 'Marathi (मराठी)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
    { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  ]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      toast.success('Recording started. Speak your medical history...')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      toast.info('Processing your recording...')
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('patient_id', patientId)
      formData.append('language_code', selectedLanguage)
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/api/voice-intake/process`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to process audio')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setExtractedData(result.data)
        toast.success('Medical information extracted successfully!')
      } else {
        throw new Error(result.error || 'Processing failed')
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process recording')
    } finally {
      setIsProcessing(false)
    }
  }

  const saveToProfile = async () => {
    if (!extractedData) return
    
    try {
      const formData = new FormData()
      formData.append('patient_id', patientId)
      formData.append('intake_data', JSON.stringify(extractedData))
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/api/voice-intake/save-intake`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to save data')
      }
      
      const result = await response.json()
      
      toast.success('Medical information saved successfully!', {
        description: 'View your saved records in History',
        action: {
          label: 'View History',
          onClick: () => window.location.href = '/patient/voice-intake-history'
        }
      })
    } catch (error) {
      console.error('Error saving data:', error)
      toast.error('Failed to save to profile')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Recording Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Record Your Medical History
          </CardTitle>
          <CardDescription>
            Select your language and speak naturally about your medical history, symptoms, and concerns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Select Language
            </label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isRecording}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4 py-8">
            {isRecording && (
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {formatTime(recordingTime)}
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  Recording...
                </div>
              </div>
            )}
            
            {isProcessing && (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-2" />
                <p className="text-muted-foreground">Processing your recording...</p>
              </div>
            )}
            
            {!isRecording && !isProcessing && (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white gap-2"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="gap-2"
              >
                <MicOff className="w-5 h-5" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">What to include:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your name and age</li>
              <li>• Main symptoms or health concerns</li>
              <li>• How long you've had these symptoms</li>
              <li>• Any chronic conditions or past illnesses</li>
              <li>• Current medications you're taking</li>
              <li>• Known allergies</li>
              <li>• Previous surgeries</li>
              <li>• Family medical history</li>
              <li>• Lifestyle habits (smoking, alcohol, exercise)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Data Display */}
      {extractedData && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Extracted Information
            </CardTitle>
            <CardDescription>
              Review the information extracted from your recording
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {extractedData.full_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{extractedData.full_name}</p>
                </div>
              )}
              {extractedData.age && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Age</label>
                  <p className="font-medium">{extractedData.age} years</p>
                </div>
              )}
              {extractedData.gender && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="font-medium capitalize">{extractedData.gender}</p>
                </div>
              )}
            </div>

            {/* Chief Complaint */}
            {extractedData.chief_complaint && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Chief Complaint</label>
                <p className="font-medium">{extractedData.chief_complaint}</p>
                {extractedData.symptom_duration && (
                  <p className="text-sm text-muted-foreground">Duration: {extractedData.symptom_duration}</p>
                )}
              </div>
            )}

            {/* Medical History */}
            {extractedData.medical_history && extractedData.medical_history.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Medical History</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {extractedData.medical_history.map((item, idx) => (
                    <Badge key={idx} variant="outline">{item}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            {extractedData.current_medications && extractedData.current_medications.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Medications</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {extractedData.current_medications.map((item, idx) => (
                    <Badge key={idx} variant="secondary">{item}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {extractedData.allergies && extractedData.allergies.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {extractedData.allergies.map((item, idx) => (
                    <Badge key={idx} variant="destructive">{item}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {extractedData.lifestyle && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Lifestyle</label>
                <div className="grid grid-cols-3 gap-4 mt-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Smoking</p>
                    <p className="font-medium capitalize">{extractedData.lifestyle.smoking}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Alcohol</p>
                    <p className="font-medium capitalize">{extractedData.lifestyle.alcohol}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Exercise</p>
                    <p className="font-medium">{extractedData.lifestyle.exercise}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transcripts */}
            <div className="space-y-2">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Transcripts
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-sm">
                    <p className="font-medium mb-1">Original ({extractedData.original_language}):</p>
                    <p className="text-muted-foreground">{extractedData.original_transcript}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-sm">
                    <p className="font-medium mb-1">English Translation:</p>
                    <p className="text-muted-foreground">{extractedData.english_transcript}</p>
                  </div>
                </div>
              </details>
            </div>

            {/* Save Button */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={saveToProfile}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save to Profile
              </Button>
              <Button
                onClick={() => setExtractedData(null)}
                variant="outline"
              >
                Record Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
