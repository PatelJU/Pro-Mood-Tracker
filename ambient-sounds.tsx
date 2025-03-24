"use client"

import { Button } from "@/components/ui/button"
import { Bird, Cloud, Coffee, Flame, BirdIcon as Cricket, Mountain, Waves, Wind, Music2, Plane, Umbrella, Trees, Volume2, VolumeX } from 'lucide-react'
import { useState } from "react"

const sounds = [
  { name: "Birds", icon: Bird },
  { name: "Rain", icon: Cloud },
  { name: "Cafe", icon: Coffee },
  { name: "Campfire", icon: Flame },
  { name: "Crickets", icon: Cricket },
  { name: "Desert", icon: Mountain },
  { name: "Ocean", icon: Waves },
  { name: "Wind", icon: Wind },
  { name: "Piano", icon: Music2 },
  { name: "Plane", icon: Plane },
  { name: "Thunder", icon: Umbrella },
  { name: "Forest", icon: Trees },
]

export function AmbientSounds() {
  const [playing, setPlaying] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">
        Listen to ambient sounds to improve your mood
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sounds.map((sound) => {
          const Icon = sound.icon
          const isPlaying = playing === sound.name
          
          return (
            <Button
              key={sound.name}
              variant={isPlaying ? "default" : "outline"}
              className="h-24 flex flex-col gap-2"
              onClick={() => setPlaying(isPlaying ? null : sound.name)}
            >
              <Icon className="h-8 w-8" />
              <span>{sound.name}</span>
              {isPlaying ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 opacity-50" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

