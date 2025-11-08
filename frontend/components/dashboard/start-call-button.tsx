'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Video } from 'lucide-react'
import { PatientSelectDialog } from './patient-select-dialog'

export function StartCallButton() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setDialogOpen(true)}
        className="w-full"
        size="lg"
      >
        <Video className="w-5 h-5 mr-2" />
        Start New Call
      </Button>

      <PatientSelectDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
