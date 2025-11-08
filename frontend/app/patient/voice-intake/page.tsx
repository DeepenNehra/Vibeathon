import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { VoiceIntakeForm } from '@/components/voice-intake/voice-intake-form'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function VoiceIntakePage() {
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
                  className="text-sm font-medium text-primary"
                >
                  Voice Intake
                </Link>
                <Link 
                  href="/patient/appointments" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  My Appointments
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
      <main className="max-w-4xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/patient/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/patient/voice-intake-history">
              <Button variant="outline" size="sm">
                View History
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            Voice-Based Medical Intake
          </h1>
          <p className="text-muted-foreground mt-2">
            Speak your medical history in any language, and we'll convert it to a structured form
          </p>
        </div>

        {/* Voice Intake Form Component */}
        <VoiceIntakeForm patientId={session.user.id} />
      </main>
    </div>
  )
}
