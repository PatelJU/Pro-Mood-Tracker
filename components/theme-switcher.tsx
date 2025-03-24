"use client"

import { Moon, Sun, Laptop, Waves, Sunset, TreePine } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import React from "react"

export function ThemeSwitcher() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="relative h-9 w-9">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const themes = [
    {
      name: "light",
      label: "Light",
      icon: Sun,
    },
    {
      name: "dark",
      label: "Dark",
      icon: Moon,
    },
    {
      name: "sunset",
      label: "Sunset",
      icon: Sunset,
    },
    {
      name: "ocean",
      label: "Ocean",
      icon: Waves,
    },
    {
      name: "forest",
      label: "Forest",
      icon: TreePine,
    },
  ]

  const getCurrentIcon = () => {
    const currentTheme = themes.find(t => t.name === theme) || themes[0]
    const Icon = currentTheme.icon
    return <Icon className="h-[1.2rem] w-[1.2rem]" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9">
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {themes.map(({ name, label, icon: Icon }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => setTheme(name)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
            {theme === name && (
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            <span>System</span>
          </div>
          {theme === "system" && (
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 