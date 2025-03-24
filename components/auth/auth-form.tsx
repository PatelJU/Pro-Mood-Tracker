"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { FcGoogle } from "react-icons/fc"

type AuthMode = "login" | "register" | "reset"

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "login") {
        await signInWithEmail(email, password)
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        })
      } else if (mode === "register") {
        await signUpWithEmail(email, password)
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        })
      } else if (mode === "reset") {
        await resetPassword(email)
        toast({
          title: "Password reset email sent",
          description: "Check your email for password reset instructions.",
        })
        setMode("login")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not sign in with Google",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}
        </CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Sign in to access your mood tracking data"
            : mode === "register"
            ? "Create an account to start tracking your moods"
            : "Enter your email to receive reset instructions"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : 
              mode === "login" ? "Sign In" :
              mode === "register" ? "Create Account" :
              "Send Reset Instructions"}
          </Button>
        </form>

        {mode !== "reset" && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {mode === "login" ? (
          <>
            <Button
              variant="link"
              className="px-0"
              onClick={() => setMode("reset")}
            >
              Forgot your password?
            </Button>
            <Button
              variant="link"
              className="px-0"
              onClick={() => setMode("register")}
            >
              Don't have an account? Sign up
            </Button>
          </>
        ) : mode === "register" ? (
          <Button
            variant="link"
            className="px-0"
            onClick={() => setMode("login")}
          >
            Already have an account? Sign in
          </Button>
        ) : (
          <Button
            variant="link"
            className="px-0"
            onClick={() => setMode("login")}
          >
            Back to sign in
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 