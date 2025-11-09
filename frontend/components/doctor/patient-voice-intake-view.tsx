'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Calendar, AlertCircle, Pill, Heart, FileText } from 'lucide-react'

interface VoiceIntakeData {
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
  created_at?: string
}

interface PatientVoiceIntakeViewProps {
  voiceIntakeData: VoiceIntakeData
  compact?: boolean
}

export function PatientVoiceIntakeView({ voiceIntakeData, compact = false }: PatientVoiceIntakeViewProps) {
  if (!voiceIntakeData) {
    return (
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardContent className="py-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No voice intake data available for this patient</p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className="border-teal-200 dark:border-teal-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Patient Voice Intake
          </CardTitle>
          {voiceIntakeData.created_at && (
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recorded: {new Date(voiceIntakeData.created_at).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Chief Complaint - Most Important */}
          {voiceIntakeData.chief_complaint && (
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <label className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Chief Complaint
              </label>
              <p className="font-medium text-red-900 dark:text-red-100 mt-1">
                {voiceIntakeData.chief_complaint}
              </p>
              {voiceIntakeData.symptom_duration && (
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Duration: {voiceIntakeData.symptom_duration}
                </p>
              )}
            </div>
          )}

          {/* Allergies - Critical */}
          {voiceIntakeData.allergies && voiceIntakeData.allergies.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <label className="text-sm font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Allergies (Critical)
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {voiceIntakeData.allergies.map((item, idx) => (
                  <Badge key={idx} variant="destructive" className="font-medium">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Current Medications */}
          {voiceIntakeData.current_medications && voiceIntakeData.current_medications.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Current Medications
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {voiceIntakeData.current_medications.map((item, idx) => (
                  <Badge key={idx} variant="secondary">{item}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* View Full Details Link */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline">
              View Full Medical History →
            </summary>
            <div className="mt-3 space-y-3">
              {/* Medical History */}
              {voiceIntakeData.medical_history && voiceIntakeData.medical_history.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medical History</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {voiceIntakeData.medical_history.map((item, idx) => (
                      <Badge key={idx} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle */}
              {voiceIntakeData.lifestyle && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lifestyle</label>
                  <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Smoking:</span>
                      <span className="ml-1 font-medium capitalize">{voiceIntakeData.lifestyle.smoking}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Alcohol:</span>
                      <span className="ml-1 font-medium capitalize">{voiceIntakeData.lifestyle.alcohol}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Exercise:</span>
                      <span className="ml-1 font-medium">{voiceIntakeData.lifestyle.exercise}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {voiceIntakeData.additional_notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                  <p className="text-sm mt-1">{voiceIntakeData.additional_notes}</p>
                </div>
              )}
            </div>
          </details>
        </CardContent>
      </Card>
    )
  }

  // Full view
  return (
    <Card className="border-teal-200 dark:border-teal-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-600" />
          Patient Voice Intake - Complete Medical History
        </CardTitle>
        <CardDescription>
          Recorded by patient in {voiceIntakeData.original_language || 'their language'} and translated to English
          {voiceIntakeData.created_at && ` on ${new Date(voiceIntakeData.created_at).toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {voiceIntakeData.full_name && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
              <p className="font-medium text-lg">{voiceIntakeData.full_name}</p>
            </div>
          )}
          {voiceIntakeData.age && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Age</label>
              <p className="font-medium text-lg">{voiceIntakeData.age} years</p>
            </div>
          )}
          {voiceIntakeData.gender && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p className="font-medium text-lg capitalize">{voiceIntakeData.gender}</p>
            </div>
          )}
        </div>

        {/* Chief Complaint - Highlighted */}
        {voiceIntakeData.chief_complaint && (
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-2 border-red-200 dark:border-red-800">
            <label className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              Chief Complaint
            </label>
            <p className="font-medium text-lg text-red-900 dark:text-red-100">
              {voiceIntakeData.chief_complaint}
            </p>
            {voiceIntakeData.symptom_duration && (
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                Duration: {voiceIntakeData.symptom_duration}
              </p>
            )}
          </div>
        )}

        {/* Allergies - Critical Alert */}
        {voiceIntakeData.allergies && voiceIntakeData.allergies.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
            <label className="text-sm font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              Allergies (Critical Information)
            </label>
            <div className="flex flex-wrap gap-2">
              {voiceIntakeData.allergies.map((item, idx) => (
                <Badge key={idx} variant="destructive" className="text-base px-3 py-1">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {voiceIntakeData.current_medications && voiceIntakeData.current_medications.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Pill className="w-5 h-5" />
              Current Medications
            </label>
            <div className="flex flex-wrap gap-2">
              {voiceIntakeData.current_medications.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="text-base px-3 py-1">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Medical History */}
        {voiceIntakeData.medical_history && voiceIntakeData.medical_history.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5" />
              Medical History
            </label>
            <div className="flex flex-wrap gap-2">
              {voiceIntakeData.medical_history.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-base px-3 py-1">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Previous Surgeries */}
        {voiceIntakeData.previous_surgeries && voiceIntakeData.previous_surgeries.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2">Previous Surgeries</label>
            <div className="flex flex-wrap gap-2">
              {voiceIntakeData.previous_surgeries.map((item, idx) => (
                <Badge key={idx} variant="outline">{item}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Family History */}
        {voiceIntakeData.family_history && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2">Family Medical History</label>
            <p className="text-sm">{voiceIntakeData.family_history}</p>
          </div>
        )}

        {/* Lifestyle */}
        {voiceIntakeData.lifestyle && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2">Lifestyle Factors</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Smoking</p>
                <p className="font-medium capitalize">{voiceIntakeData.lifestyle.smoking}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alcohol</p>
                <p className="font-medium capitalize">{voiceIntakeData.lifestyle.alcohol}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exercise</p>
                <p className="font-medium">{voiceIntakeData.lifestyle.exercise}</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {voiceIntakeData.additional_notes && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</label>
            <p className="text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              {voiceIntakeData.additional_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
