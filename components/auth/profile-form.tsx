"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export function ProfileForm() {
  const { profile, updateUserProfile, updateUserEmail, updateUserPassword } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Profile update state
  const [displayName, setDisplayName] = useState(profile?.displayName || "")
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "")
  
  // Email update state
  const [newEmail, setNewEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  
  // Password update state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUserProfile({ displayName, photoURL })
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUserEmail(newEmail, emailPassword)
      toast({
        title: "Email Updated",
        description: "Your email has been successfully updated.",
      })
      setNewEmail("")
      setEmailPassword("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      await updateUserPassword(currentPassword, newPassword)
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.photoURL || undefined} />
            <AvatarFallback>{profile?.displayName?.[0] || profile?.email?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile?.displayName || "Profile Settings"}</CardTitle>
            <CardDescription>{profile?.email}</CardDescription>
            {profile?.createdAt && (
              <p className="text-sm text-muted-foreground">
                Member since {format(profile.createdAt, "MMMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photoURL">Profile Photo URL</Label>
                <Input
                  id="photoURL"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new.email@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailPassword">Current Password</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Email"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="password">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Last login: {profile?.lastLoginAt ? format(profile.lastLoginAt, "PPpp") : "Never"}
      </CardFooter>
    </Card>
  )
} 