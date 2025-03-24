import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Share2, Users, Lock, Globe, Heart, MessageCircle, Award, Shield, UserPlus, Bell } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { MoodData, MoodLevel, moodDescriptions } from "@/types/mood"

interface SupportNetwork {
  id: string
  name: string
  email: string
  relationship: string
  canViewMoods: boolean
  canViewNotes: boolean
  canReceiveAlerts: boolean
}

interface SharedInsight {
  id: string
  title: string
  description: string
  date: Date
  isPublic: boolean
  likes: number
  comments: number
  author: {
    name: string
    avatar?: string
  }
}

interface MoodSocialProps {
  moodData: MoodData
  onShareInsight: (insight: SharedInsight) => void
  onAddSupport: (contact: SupportNetwork) => void
  insights: SharedInsight[]
  contacts: SupportNetwork[]
  onDeleteContact: (contactId: string) => void
}

export function MoodSocial({ moodData, onShareInsight, onAddSupport, insights, contacts, onDeleteContact }: MoodSocialProps) {
  const [newContact, setNewContact] = useState<Partial<SupportNetwork>>({
    canViewMoods: false,
    canViewNotes: false,
    canReceiveAlerts: false
  })
  const { toast } = useToast()

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email for your support contact.",
        variant: "destructive"
      })
      return
    }

    const contact: SupportNetwork = {
      id: crypto.randomUUID(),
      name: newContact.name,
      email: newContact.email,
      relationship: newContact.relationship || "Friend",
      canViewMoods: newContact.canViewMoods || false,
      canViewNotes: newContact.canViewNotes || false,
      canReceiveAlerts: newContact.canReceiveAlerts || false
    }

    onAddSupport(contact)
    setNewContact({
      canViewMoods: false,
      canViewNotes: false,
      canReceiveAlerts: false
    })
    
    toast({
      title: "Contact Added",
      description: `${contact.name} has been added to your support network.`,
    })
  }

  const handleShareInsight = (isPublic: boolean) => {
    // Generate insight from recent mood data
    const recentEntries = Object.entries(moodData)
      .slice(-7)
      .flatMap(([date, entries]) => Object.entries(entries)
        .map(([time, entry]) => ({
          date,
          time,
          level: entry.level,
          note: entry.note
        }))
      )

    if (recentEntries.length === 0) {
      toast({
        title: "No Recent Data",
        description: "Add some mood entries before sharing insights.",
        variant: "destructive"
      })
      return
    }

    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.level, 0) / recentEntries.length
    const predominantMood = Object.entries(
      recentEntries.reduce((acc, entry) => {
        acc[entry.level] = (acc[entry.level] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    ).sort(([, a], [, b]) => b - a)[0][0]

    const insight: SharedInsight = {
      id: crypto.randomUUID(),
      title: "Weekly Mood Update",
      description: `This week, I've been feeling predominantly ${moodDescriptions[Number(predominantMood) as MoodLevel].toLowerCase()} with an average mood of ${avgMood.toFixed(1)}. ${
        avgMood > 3.5 
          ? "It's been a positive week!" 
          : avgMood < 2.5 
          ? "I'm working through some challenges."
          : "I'm maintaining a balanced outlook."
      }`,
      date: new Date(),
      isPublic,
      likes: 0,
      comments: 0,
      author: {
        name: "You",
        avatar: undefined
      }
    }

    onShareInsight(insight)
    
    toast({
      title: "Insight Shared",
      description: isPublic 
        ? "Your insight has been shared with the community."
        : "Your insight has been shared with your support network.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Support Network */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Support Network</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setNewContact({
            canViewMoods: false,
            canViewNotes: false,
            canReceiveAlerts: false
          })}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* New Contact Form */}
          {newContact && (
            <Card>
              <CardHeader>
                <CardTitle>Add Support Contact</CardTitle>
                <CardDescription>Add someone to your support network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Contact name..."
                    value={newContact.name || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="contact@example.com"
                    value={newContact.email || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input
                    placeholder="Friend, Family, Therapist..."
                    value={newContact.relationship || ""}
                    onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      View Moods
                      <Badge variant="outline">
                        <Lock className="h-3 w-3" />
                      </Badge>
                    </Label>
                    <Switch
                      checked={newContact.canViewMoods}
                      onCheckedChange={(checked) => setNewContact(prev => ({ ...prev, canViewMoods: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      View Notes
                      <Badge variant="outline">
                        <Lock className="h-3 w-3" />
                      </Badge>
                    </Label>
                    <Switch
                      checked={newContact.canViewNotes}
                      onCheckedChange={(checked) => setNewContact(prev => ({ ...prev, canViewNotes: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      Receive Alerts
                      <Badge variant="outline">
                        <Bell className="h-3 w-3" />
                      </Badge>
                    </Label>
                    <Switch
                      checked={newContact.canReceiveAlerts}
                      onCheckedChange={(checked) => setNewContact(prev => ({ ...prev, canReceiveAlerts: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewContact({
                  canViewMoods: false,
                  canViewNotes: false,
                  canReceiveAlerts: false
                })}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact}>
                  Add Contact
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Existing Contacts */}
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {contact.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{contact.name}</CardTitle>
                      <CardDescription>{contact.relationship}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    Trusted
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">View Moods</span>
                    <Badge variant={contact.canViewMoods ? "default" : "secondary"}>
                      {contact.canViewMoods ? "Allowed" : "Restricted"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">View Notes</span>
                    <Badge variant={contact.canViewNotes ? "default" : "secondary"}>
                      {contact.canViewNotes ? "Allowed" : "Restricted"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Receive Alerts</span>
                    <Badge variant={contact.canReceiveAlerts ? "default" : "secondary"}>
                      {contact.canReceiveAlerts ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Shared Insights */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Shared Insights</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleShareInsight(false)}>
              <Lock className="h-4 w-4 mr-2" />
              Share with Network
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShareInsight(true)}>
              <Globe className="h-4 w-4 mr-2" />
              Share Publicly
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {insight.author.avatar ? (
                          <AvatarImage src={insight.author.avatar} />
                        ) : (
                          <AvatarFallback>
                            {insight.author.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <CardDescription>
                          {insight.author.name} • {format(insight.date, "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={insight.isPublic ? "default" : "secondary"}>
                      {insight.isPublic ? (
                        <Globe className="h-3 w-3 mr-1" />
                      ) : (
                        <Lock className="h-3 w-3 mr-1" />
                      )}
                      {insight.isPublic ? "Public" : "Network"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Heart className="h-4 w-4" />
                      {insight.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {insight.comments}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 