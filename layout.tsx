import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { MoodCalendar } from "./mood-calendar"
import { MoodStats } from "./mood-stats"
import { AmbientSounds } from "./ambient-sounds"

export default function Layout() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Aura: Track Your Mood</h1>
      
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="sounds">Ambient Sounds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <Card className="p-6">
            <MoodStats />
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card className="p-6">
            <MoodCalendar />
          </Card>
        </TabsContent>
        
        <TabsContent value="sounds">
          <Card className="p-6">
            <AmbientSounds />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

