import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MoodData, MoodLevel, TimeOfDay, MoodEntry } from '../../types/mood'
import { formatDate } from '../../utils/date'

interface MoodStore {
  moodData: MoodData
  selectedDate: Date | null | undefined
  isEditing: boolean
  editingEntry: MoodEntry | null | undefined
  showHistoryModal: boolean
  selectedHistoryEntry: { date: string; entry: MoodEntry } | null
  setSelectedDate: (date: Date | null | undefined) => void
  saveMood: (timeOfDay: TimeOfDay, level: MoodLevel, note: string) => void
  editEntry: (date: string, entry: MoodEntry) => void
  toggleHistoryModal: (show: boolean) => void
  setSelectedHistoryEntry: (entry: { date: string; entry: MoodEntry } | null) => void
  resetDay: (date: Date) => void
}

type MoodState = Pick<MoodStore, 'moodData'>

export const useMoodStore = create<MoodStore>()(
  persist(
    (set) => ({
      moodData: {},
      selectedDate: new Date(),
      isEditing: false,
      editingEntry: null,
      showHistoryModal: false,
      selectedHistoryEntry: null,

      setSelectedDate: (date) => set({ selectedDate: date }),
      
      saveMood: (timeOfDay, level, note) => set((state) => ({
        moodData: {
          ...state.moodData,
          [formatDate(state.selectedDate!)]: {
            ...state.moodData[formatDate(state.selectedDate!)],
            [timeOfDay]: { timeOfDay, level, note }
          }
        }
      })),

      editEntry: (date, entry) => set({
        isEditing: true,
        editingEntry: entry,
        selectedDate: new Date(date)
      }),

      toggleHistoryModal: (show) => set({ showHistoryModal: show }),

      setSelectedHistoryEntry: (entry) => set({ 
        selectedHistoryEntry: entry,
        showHistoryModal: entry !== null 
      }),

      resetDay: (date) =>
        set((state) => {
          const dateStr = formatDate(date)
          const newMoodData = { ...state.moodData }
          delete newMoodData[dateStr]
          return { moodData: newMoodData }
        })
    }),
    {
      name: 'mood-storage',
      partialize: (state): MoodState => ({ 
        moodData: state.moodData 
      })
    }
  )
) 