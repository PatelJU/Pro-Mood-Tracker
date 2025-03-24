export interface ThemeConfig {
  name: string
  label: string
  colors: {
    background: string
    foreground: string
    primary: string
    "primary-foreground": string
    card: string
    "card-foreground": string
    "popover-foreground": string
    "muted-foreground": string
    accent: string
    "accent-foreground": string
    border: string
    input: string
    ring: string
  }
  moodColors: {
    [key: number]: {
      bg: string
      text: string
    }
  }
} 