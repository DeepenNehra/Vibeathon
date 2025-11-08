'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { User, Plus, Search } from 'lucide-react'

interface Patient {
  id: string
  name: string
  date_of_birth: string
  preferred_language: string
}

interface PatientSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientSelectDialog({ open, onOpenChange }: PatientSelectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: '',
    date_of_birth: '',
    preferred_language: 'hi'
  })
  const router = useRouter()

  // Load patients when dialog opens
  useEffect(() => {
    if (open) {
      loadPatients()
    }
  }, [open])

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, date_of_birth, preferred_language')
        .order('name')

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error('Failed to load patients')
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectPatient = async (patientId: string) => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Session expired. Please sign in again.')
        router.push('/auth')
        return
      }

      // Create consultation
      const { data: consultation, error } = await supabase
        .from('consultations')
        .insert({
          patient_id: patientId,
          doctor_id: session.user.id,
          consultation_date: new Date().toISOString(),
          full_transcript: '',
          approved: false
        })
        .select('id')
        .single()

      if (error) throw error

      toast.success('Consultation started!')
      onOpenChange(false)
      router.push(`/consultation/${consultation.id}/room?userType=doctor`)
    } catch (error) {
      console.error('Error starting consultation:', error)
      toast.error('Failed to start consultation')
      setIsLoading(false)
    }
  }

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          name: newPatient.name,
          date_of_birth: newPatient.date_of_birth,
          preferred_language: newPatient.preferred_language,
          emotion_analysis_enabled: true
        })
        .select('id')
        .single()

      if (error) throw error

      toast.success('Patient created!')
      await loadPatients()
      setShowNewPatientForm(false)
      setNewPatient({ name: '', date_of_birth: '', preferred_language: 'hi' })
      
      // Automatically start consultation with new patient
      await handleSelectPatient(data.id)
    } catch (error) {
      console.error('Error creating patient:', error)
      toast.error('Failed to create patient')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showNewPatientForm ? 'Add New Patient' : 'Select Patient'}
          </DialogTitle>
          <DialogDescription>
            {showNewPatientForm 
              ? 'Enter patient details to create a new record'
              : 'Choose a patient to start a consultation'
            }
          </DialogDescription>
        </DialogHeader>

        {showNewPatientForm ? (
          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Patient Name *</Label>
              <Input
                id="name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="Enter patient name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={newPatient.date_of_birth}
                onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language *</Label>
              <select
                id="language"
                value={newPatient.preferred_language}
                onChange={(e) => setNewPatient({ ...newPatient, preferred_language: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={isLoading}
              >
                <option value="hi">Hindi (हिंदी)</option>
                <option value="en">English</option>
              </select>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewPatientForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create & Start Call
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setShowNewPatientForm(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Patient
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No patients found' : 'No patients yet'}
                    </p>
                    <Button
                      onClick={() => setShowNewPatientForm(true)}
                      variant="outline"
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Patient
                    </Button>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient.id)}
                      disabled={isLoading}
                      className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            DOB: {new Date(patient.date_of_birth).toLocaleDateString()} • 
                            Language: {patient.preferred_language === 'hi' ? 'Hindi' : 'English'}
                          </p>
                        </div>
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
