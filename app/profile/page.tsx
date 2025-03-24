import { ProfileForm } from "@/components/auth/profile-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <ProfileForm />
      </div>
    </ProtectedRoute>
  )
} 