import { AlertTriangle, Award, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface AcademicStandingAlertProps {
  gpa: number | null
  firstName: string
}

export function AcademicStandingAlert({ gpa, firstName }: AcademicStandingAlertProps) {
  if (gpa === null) return null

  // Only show alert for academic probation
  if (gpa >= 2.0) return null

  return (
    <Card className="border-destructive bg-destructive/5">
      <CardContent className="flex items-start gap-4 py-4">
        <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-destructive">Academic Probation Warning</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {firstName}, your cumulative GPA ({gpa.toFixed(2)}) is below the 2.0 minimum required for
            good academic standing. You are currently on <strong>academic probation</strong>.
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Meet with your academic advisor to create an improvement plan</li>
            <li>Consider reducing your course load next semester</li>
            <li>Take advantage of tutoring and academic support services</li>
            <li>A GPA of 2.0 or higher is required to return to good standing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
