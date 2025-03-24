import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Check for missing environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(`Missing Firebase environment variable: ${key}`)
  }
})

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBEYZrPrVZt2zEXKVUXHm-_8LxCTxpXtl4",
  authDomain: "mood-tracker-3-3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mood-tracker-3-3",
  storageBucket: "mood-tracker-3-3.appspot.com",
  messagingSenderId: "1012475937742",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1012475937742:web:c0c0c0c0c0c0c0c0c0c0c0",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize analytics only on the client side and when supported
let analytics = null
if (typeof window !== 'undefined') {
  // Check if analytics is supported before initializing
  isSupported()
    .then(supported => {
      if (supported && firebaseConfig.measurementId) {
        analytics = getAnalytics(app)
      }
    })
    .catch(error => {
      console.error('Error checking analytics support:', error)
    })
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export { analytics }

// Export config validation for testing
export const validateConfig = () => {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  }
} 