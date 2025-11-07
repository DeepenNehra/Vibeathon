import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StartCallButton } from '@/components/dashboard/start-call-button'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'

interface Patient {
  name: string
  preferred_language: string
}

interface Consultation {
  id: string
  consultation_date: string
  patient_id: string
  approved: boolean
  patients: Patient | Patient[] | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  // Fetch upcoming consultations for the authenticated doctor
  let upcomingConsultations: Consultation[] = []
  
  try {
    const { data: consultations, error } = await supabase
      .from('consultations')
      .select(`
        id,
        consultation_date,
        patient_id,
        approved,
        patients (
          name,
          preferred_language
        )
      `)
      .eq('doctor_id', session.user.id)
      .order('consultation_date', { ascending: true })
      .limit(10)

    if (!error && consultations) {
      upcomingConsultations = consultations as Consultation[]
    }
  } catch (err) {
    // Silently handle database errors - tables might not exist yet
    upcomingConsultations = []
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation Header */}
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/dashboard" />
              <nav className="flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-primary"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/records" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Patient Records
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome, Dr. {session.user.email}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Start New Consultation</CardTitle>
              <CardDescription>Begin a new video consultation with a patient</CardDescription>
            </CardHeader>
            <CardContent>
              <StartCallButton />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>View and manage patient information</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/records">
                <Button variant="outline" className="w-full">
                  View All Records
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Consultations</CardTitle>
            <CardDescription>Your consultation history</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingConsultations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No consultations yet. Start your first consultation above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">
                            {Array.isArray(consultation.patients) 
                              ? consultation.patients[0]?.name 
                              : consultation.patients?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(consultation.consultation_date).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                          {Array.isArray(consultation.patients)
                            ? consultation.patients[0]?.preferred_language
                            : consultation.patients?.preferred_language || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {consultation.approved ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Approved
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          Pending Review
                        </span>
                      )}
                      <Link href={`/consultation/${consultation.id}/review`}>
                        <Button variant="outline" size="sm">
                          View Notes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
