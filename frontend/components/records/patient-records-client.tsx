'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, User, Calendar, Languages } from 'lucide-react'

interface Consultation {
  id: string
  consultation_date: string
  approved: boolean
  raw_soap_note: any
}

interface Patient {
  id: string
  name: string
  date_of_birth: string
  preferred_language: string
  consultations: Consultation[]
}

interface PatientRecordsClientProps {
  patients: Patient[]
}

export function PatientRecordsClient({ patients }: PatientRecordsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return patients
    }

    const query = searchQuery.toLowerCase()
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(query) ||
      patient.preferred_language.toLowerCase().includes(query)
    )
  }, [patients, searchQuery])

  // Get selected patient details
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null
    return patients.find(p => p.id === selectedPatientId) || null
  }, [selectedPatientId, patients])

  // Calculate patient age
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Patients Yet</CardTitle>
          <CardDescription>You haven't had any consultations yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Start a consultation from the dashboard to see patient records here.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Patient List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <CardDescription>
              {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No patients found
                </p>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedPatientId === patient.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{patient.name}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Languages className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {patient.preferred_language}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Age: {calculateAge(patient.date_of_birth)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        {patient.consultations.length}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultation History */}
      <div className="lg:col-span-2">
        {selectedPatient ? (
          <Card>
            <CardHeader>
              <CardTitle>Consultation History</CardTitle>
              <CardDescription>
                {selectedPatient.name} - {selectedPatient.consultations.length} consultation
                {selectedPatient.consultations.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPatient.consultations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No consultations recorded for this patient
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPatient.consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">
                              {new Date(consultation.consultation_date).toLocaleString('en-IN', {
                                dateStyle: 'long',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>
                          
                          {consultation.raw_soap_note && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm">
                                <span className="font-semibold text-muted-foreground">S:</span>
                                <p className="text-muted-foreground line-clamp-2 mt-1">
                                  {consultation.raw_soap_note.subjective || 'N/A'}
                                </p>
                              </div>
                              <div className="text-sm">
                                <span className="font-semibold text-muted-foreground">A:</span>
                                <p className="text-muted-foreground line-clamp-2 mt-1">
                                  {consultation.raw_soap_note.assessment || 'N/A'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-3 ml-4">
                          {consultation.approved ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
                              Approved
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 whitespace-nowrap">
                              Pending Review
                            </span>
                          )}
                          
                          <Link href={`/consultation/${consultation.id}/review`}>
                            <Button variant="outline" size="sm">
                              View SOAP Note
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Select a Patient</CardTitle>
              <CardDescription>Choose a patient to view their consultation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Select a patient from the list to view their consultation history and SOAP notes
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
