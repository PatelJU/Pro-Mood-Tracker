"use client"

import { ErrorBoundary } from 'react-error-boundary'
import { MoodTracker } from '../components/mood-tracker'
import { MoodStats } from '@/components/mood-stats'
function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="text-center p-4">
      <h2 className="text-red-600">Something went wrong:</h2>
      <pre className="text-sm">{error.message}</pre>
    </div>
  )
}

export default function Page() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MoodTracker />
    </ErrorBoundary>
  )
}

