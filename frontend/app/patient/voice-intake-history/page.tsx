import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface VoiceIntakeRecord {
  id: string
  created_at: string
  full_name: string | null
  age: number | null
  chief_complaint: string | null
  symptom_duration: string | null
  medical_history: string[] | null
  current_medications: string[] | null
  allergies: string[] | null
  language_code: string | null
  intake_data: any
}

export default async function VoiceIntakeHistoryPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  const userRole = session.user.user_metadata?.role
  if (userRole !== 'patient') {
    redirect('/dashboard')
  }

  // Fetch voice intake records
  let records: VoiceIntakeRecord[] = []
  try {
    const { data, error } = await supabase
      .from('voice_intake_records')
      .select('*')
      .eq('patient_id', session.user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      records = data as VoiceIntakeRecord[]
    }
  } catch (err) {
    console.error('Error fetching voice intake records:', err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950 dark:via-blue-950 dark:to-teal-950">
      {/* Navigation Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/patient/dashboard" />
              <nav className="hidden md:flex gap-6">
                <Link 
                  href="/patient/dashboard" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/patient/voice-intake" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Voice Intake
                </Link>
                <Link 
                  href="/patient/voice-intake-history" 
                  className="text-sm font-medium text-primary"
                >
                  History
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <Link href="/patient/voice-intake">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Voice Intake
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            Voice Intake History
          </h1>
          <p className="text-muted-foreground mt-2">
            View all your saved voice intake records
          </p>
        </div>

        {/* Records List */}
        {records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No voice intake records yet. Create your first one!
              </p>
              <Link href="/patient/voice-intake">
                <Button className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white">
                  Create Voice Intake
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-600" />
                        {record.full_name || 'Voice Intake Record'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    {record.language_code && (
                      <Badge variant="outline">
                        {record.language_code}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  {(record.age || record.chief_complaint) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {record.age && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Age</label>
                          <p className="font-medium">{record.age} years</p>
                        </div>
                      )}
                      {record.chief_complaint && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Chief Complaint</label>
                          <p className="font-medium">{record.chief_complaint}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Symptom Duration */}
                  {record.symptom_duration && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Duration</label>
                      <p className="font-medium">{record.symptom_duration}</p>
                    </div>
                  )}

                  {/* Medical History */}
                  {record.medical_history && record.medical_history.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Medical History</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {record.medical_history.map((item, idx) => (
                          <Badge key={idx} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {record.current_medications && record.current_medications.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Medications</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {record.current_medications.map((item, idx) => (
                          <Badge key={idx} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {record.allergies && record.allergies.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {record.allergies.map((item, idx) => (
                          <Badge key={idx} variant="destructive">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Full Details */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      View Full Details
                    </summary>
                    <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-4 rounded text-sm">
                      <pre className="whitespace-pre-wrap overflow-auto">
                        {JSON.stringify(record.intake_data, null, 2)}
                      </pre>
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
