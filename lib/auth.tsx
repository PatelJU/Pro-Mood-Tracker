"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged, 
  User,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { auth } from './firebase'

interface UserProfile {
  displayName: string | null
  email: string | null
  photoURL: string | null
  createdAt: Date | null
  lastLoginAt: Date | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
  updateUserEmail: (newEmail: string, password: string) => Promise<void>
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        setProfile({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : null,
          lastLoginAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null
        })
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error signing in with email:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        await updateProfile(user, { displayName })
      }
    } catch (error) {
      console.error('Error signing up with email:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    try {
      const { displayName, photoURL } = data
      await updateProfile(user, { displayName: displayName || null, photoURL: photoURL || null })
      setProfile(prev => prev ? { ...prev, ...data } : null)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const updateUserEmail = async (newEmail: string, password: string) => {
    if (!user || !user.email) throw new Error('No user logged in')
    try {
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)
      await updateEmail(user, newEmail)
      setProfile(prev => prev ? { ...prev, email: newEmail } : null)
    } catch (error) {
      console.error('Error updating email:', error)
      throw error
    }
  }

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('No user logged in')
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 