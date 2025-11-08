import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { DoctorProfileCard } from '@/components/dashboard/doctor-profile-card'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your professional information and preferences
        </p>
      </div>

      <DoctorProfileCard />
    </div>
  )
}
