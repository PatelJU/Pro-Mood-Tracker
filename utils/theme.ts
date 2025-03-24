import { MoodLevel } from '../types/mood'

export const moodColors: Record<MoodLevel, { bg: string; text: string; border: string; dot: string; gradient: string; ring: string }> = {
  1: {
    bg: '#ef4444',
    text: '#b91c1c',
    border: '#dc2626',
    dot: '#dc2626',
    gradient: 'from-red-500',
    ring: 'ring-red-500'
  },
  2: {
    bg: '#f97316',
    text: '#c2410c',
    border: '#ea580c',
    dot: '#ea580c',
    gradient: 'from-orange-500',
    ring: 'ring-orange-500'
  },
  3: {
    bg: '#facc15',
    text: '#a16207',
    border: '#ca8a04',
    dot: '#ca8a04',
    gradient: 'from-yellow-500',
    ring: 'ring-yellow-500'
  },
  4: {
    bg: '#84cc16',
    text: '#3f6212',
    border: '#65a30d',
    dot: '#65a30d',
    gradient: 'from-lime-500',
    ring: 'ring-lime-500'
  },
  5: {
    bg: '#22c55e',
    text: '#15803d',
    border: '#16a34a',
    dot: '#16a34a',
    gradient: 'from-green-500',
    ring: 'ring-green-500'
  }
}

export const gradients = {
  subtle: "bg-white border border-black/10",
  primary: "bg-white border border-black/10"
}

