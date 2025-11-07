import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ userType?: string }>
}

export default async function ConsultationRoomPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { id } = await params
  const { userType } = await searchParams

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation Header */}
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold">Arogya-AI</h1>
              <span className="text-sm text-muted-foreground">
                Consultation Room
              </span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Exit Room
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Call Room - Coming Soon</CardTitle>
            <CardDescription>
              Consultation ID: {id} | User Type: {userType || 'unknown'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The video call room with WebRTC and live translation will be implemented in task 11.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Features to be implemented:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>WebRTC video/audio connection</li>
                <li>Audio capture and streaming to backend</li>
                <li>Live caption display with translations</li>
                <li>Call controls (end call, mute, etc.)</li>
              </ul>
            </div>
            <Link href="/dashboard">
              <Button className="mt-6">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
