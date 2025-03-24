import { type ThemeConfig } from "@/types/theme"

export const themes: ThemeConfig[] = [
  {
    name: "light",
    label: "Light",
    colors: {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(224 71.4% 4.1%)",
      primary: "hsl(220.9 39.3% 11%)",
      "primary-foreground": "hsl(210 20% 98%)",
      card: "hsl(0 0% 100%)",
      "card-foreground": "hsl(224 71.4% 4.1%)",
      "popover-foreground": "hsl(224 71.4% 4.1%)",
      "muted-foreground": "hsl(220 8.9% 46.1%)",
      accent: "hsl(220 14.3% 95.9%)",
      "accent-foreground": "hsl(220.9 39.3% 11%)",
      border: "hsl(220 13% 91%)",
      input: "hsl(220 13% 91%)",
      ring: "hsl(224 71.4% 4.1%)",
    },
    moodColors: {
      1: { bg: "bg-red-400", text: "text-white" },
      2: { bg: "bg-orange-400", text: "text-white" },
      3: { bg: "bg-yellow-400", text: "text-black" },
      4: { bg: "bg-green-400", text: "text-white" },
      5: { bg: "bg-emerald-500", text: "text-white" }
    }
  },
  {
    name: "dark",
    label: "Dark",
    colors: {
      background: "hsl(224 71.4% 4.1%)",
      foreground: "hsl(210 20% 98%)",
      primary: "hsl(210 20% 98%)",
      "primary-foreground": "hsl(220.9 39.3% 11%)",
      card: "hsl(224 71.4% 4.1%)",
      "card-foreground": "hsl(210 20% 98%)",
      "popover-foreground": "hsl(210 20% 98%)",
      "muted-foreground": "hsl(217.9 10.6% 64.9%)",
      accent: "hsl(216 34% 17%)",
      "accent-foreground": "hsl(210 20% 98%)",
      border: "hsl(216 34% 17%)",
      input: "hsl(216 34% 17%)",
      ring: "hsl(216 34% 17%)",
    },
    moodColors: {
      1: { bg: "bg-red-500", text: "text-white" },
      2: { bg: "bg-orange-500", text: "text-white" },
      3: { bg: "bg-yellow-500", text: "text-white" },
      4: { bg: "bg-green-500", text: "text-white" },
      5: { bg: "bg-emerald-600", text: "text-white" }
    }
  },
  {
    name: "sunset",
    label: "Sunset",
    colors: {
      background: "hsl(20 14.3% 4.1%)",
      foreground: "hsl(60 9.1% 97.8%)",
      primary: "hsl(20.5 90.2% 48.2%)",
      "primary-foreground": "hsl(60 9.1% 97.8%)",
      card: "hsl(20 14.3% 4.1%)",
      "card-foreground": "hsl(60 9.1% 97.8%)",
      "popover-foreground": "hsl(60 9.1% 97.8%)",
      "muted-foreground": "hsl(20 7.9% 64.9%)",
      accent: "hsl(20 14.3% 95.9%)",
      "accent-foreground": "hsl(20.5 90.2% 48.2%)",
      border: "hsl(20 14.3% 95.9%)",
      input: "hsl(20 14.3% 95.9%)",
      ring: "hsl(20.5 90.2% 48.2%)",
    },
    moodColors: {
      1: { bg: "bg-rose-500", text: "text-white" },
      2: { bg: "bg-orange-500", text: "text-white" },
      3: { bg: "bg-amber-500", text: "text-white" },
      4: { bg: "bg-yellow-500", text: "text-white" },
      5: { bg: "bg-orange-400", text: "text-white" }
    }
  },
  {
    name: "ocean",
    label: "Ocean",
    colors: {
      background: "hsl(200 65% 98%)",
      foreground: "hsl(200 70% 10%)",
      primary: "hsl(200 95% 35%)",
      "primary-foreground": "hsl(200 65% 98%)",
      card: "hsl(200 65% 98%)",
      "card-foreground": "hsl(200 70% 10%)",
      "popover-foreground": "hsl(200 70% 10%)",
      "muted-foreground": "hsl(200 30% 40%)",
      accent: "hsl(200 65% 90%)",
      "accent-foreground": "hsl(200 95% 35%)",
      border: "hsl(200 65% 90%)",
      input: "hsl(200 65% 90%)",
      ring: "hsl(200 95% 35%)",
    },
    moodColors: {
      1: { bg: "bg-cyan-700", text: "text-white" },
      2: { bg: "bg-cyan-600", text: "text-white" },
      3: { bg: "bg-cyan-500", text: "text-white" },
      4: { bg: "bg-cyan-400", text: "text-white" },
      5: { bg: "bg-cyan-300", text: "text-black" }
    }
  },
  {
    name: "forest",
    label: "Forest",
    colors: {
      background: "hsl(150 40% 98%)",
      foreground: "hsl(150 40% 6%)",
      primary: "hsl(150 40% 20%)",
      "primary-foreground": "hsl(150 40% 98%)",
      card: "hsl(150 40% 98%)",
      "card-foreground": "hsl(150 40% 6%)",
      "popover-foreground": "hsl(150 40% 6%)",
      "muted-foreground": "hsl(150 20% 40%)",
      accent: "hsl(150 40% 90%)",
      "accent-foreground": "hsl(150 40% 20%)",
      border: "hsl(150 40% 90%)",
      input: "hsl(150 40% 90%)",
      ring: "hsl(150 40% 20%)",
    },
    moodColors: {
      1: { bg: "bg-emerald-700", text: "text-white" },
      2: { bg: "bg-emerald-600", text: "text-white" },
      3: { bg: "bg-emerald-500", text: "text-white" },
      4: { bg: "bg-emerald-400", text: "text-white" },
      5: { bg: "bg-emerald-300", text: "text-black" }
    }
  }
]

export const defaultTheme = "light"

export function getThemeConfig(themeName: string): ThemeConfig {
  return themes.find(theme => theme.name === themeName) || themes[0]
}

export function getThemeColors(themeName: string) {
  const theme = getThemeConfig(themeName)
  return theme.colors
}

export function getMoodColors(themeName: string) {
  const theme = getThemeConfig(themeName)
  return theme.moodColors
} 