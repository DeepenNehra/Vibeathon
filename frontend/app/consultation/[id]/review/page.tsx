import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultationReviewPage({ params }: PageProps) {
  const supabase = await createClient()
  const { id } = await params

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
                SOAP Note Review
              </span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>SOAP Note Review - Coming Soon</CardTitle>
            <CardDescription>
              Consultation ID: {id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The SOAP note review interface will be implemented in task 12.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Features to be implemented:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Display AI-generated SOAP note sections (S, O, A, P)</li>
                <li>Editable text areas for each section</li>
                <li>Compassion Reflex suggestions with accept/reject options</li>
                <li>Community Lexicon contribution interface</li>
                <li>Note approval and save functionality</li>
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
