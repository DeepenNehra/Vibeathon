import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DoctorAppointmentsList } from '@/components/appointments/doctor-appointments-list'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AvailabilityToggle } from '@/components/dashboard/availability-toggle'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Users, Heart, Brain, Shield, Video, Award, Calendar, Sparkles, Zap, TrendingUp } from 'lucide-react'

interface Appointment {
  id: string
  patient_id: string
  date: string
  time: string
  status: string
  symptom_category: string | null
  severity: number | null
  consultation_fee: number
  created_at: string
}

function extractDoctorName(email: string): string {
  const username = email.split('@')[0]
  const cleanName = username.replace(/[0-9_.-]/g, '')
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  const userRole = session.user.user_metadata?.role
  if (userRole === 'patient') {
    redirect('/patient/dashboard')
  }

  // Fetch doctor profile from database
  let doctorName = 'Doctor'
  try {
    const { data: doctorProfile } = await supabase
      .from('doctors')
      .select('full_name')
      .eq('id', session.user.id)
      .single()
    
    if (doctorProfile?.full_name) {
      doctorName = doctorProfile.full_name
    } else {
      doctorName = extractDoctorName(session.user.email || 'Doctor')
    }
  } catch (error) {
    doctorName = extractDoctorName(session.user.email || 'Doctor')
  }

  // Fetch scheduled appointments from database
  let scheduledAppointments: Appointment[] = []
  let totalAppointments = 0
  
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch all appointments for stats
    const { data: allAppointments } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('doctor_id', session.user.id)
    
    totalAppointments = allAppointments?.length || 0
    
    // Fetch upcoming scheduled appointments
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', session.user.id)
      .eq('status', 'scheduled')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(5)

    if (!error && appointments) {
      scheduledAppointments = appointments as Appointment[]
    }
  } catch (err) {
    console.error('Error fetching appointments:', err)
    scheduledAppointments = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950 dark:via-blue-950 dark:to-teal-950">
      {/* Navigation Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/dashboard" />
              <nav className="hidden md:flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-primary"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/doctor/appointments" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  My Appointments
                </Link>
                <Link 
                  href="/records" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Patient Records
                </Link>
                <Link 
                  href="/profile" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <AvailabilityToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Hero Section */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-teal-950/30 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-teal-400/10 rounded-3xl animate-gradient-shift" />
          
          <div className="relative p-8 md:p-12">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse-slow" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {doctorName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Welcome, Dr. {doctorName}!
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500 animate-heartbeat" />
                      Ready to provide exceptional care
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {scheduledAppointments.length}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalAppointments}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List - Show quick preview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled consultations</CardDescription>
              </div>
              <Link href="/doctor/appointments">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {scheduledAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(apt.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{apt.time || 'Time TBD'}</p>
                    </div>
                    <Link href={`/consultation/${apt.id}/room?userType=doctor`}>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        <Video className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-cyan-200/50 dark:border-cyan-800/50">
            <CardHeader>
              <Brain className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-2" />
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>Smart Medical Analysis</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-green-200/50 dark:border-green-800/50">
            <CardHeader>
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <CardTitle>HIPAA Secure</CardTitle>
              <CardDescription>Protected Patient Data</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-pink-200/50 dark:border-pink-800/50">
            <CardHeader>
              <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-2" />
              <CardTitle>Patient Care</CardTitle>
              <CardDescription>Always First Priority</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-blue-200/50 dark:border-blue-800/50">
            <CardHeader>
              <Award className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <CardTitle>Excellence</CardTitle>
              <CardDescription>Top-Rated Service</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
