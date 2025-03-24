"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X, AlertTriangle, PartyPopper, Sparkles, Brain, Heart, Music, Book, Sun, Loader2, Smile, Calendar, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { useMoodStore } from "../store/moodStore"
import { formatDate } from "../utils/date"
import { MoodLevel } from "../types/mood"
import { formatDistance, formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  type?: 'warning' | 'celebration' | 'quote' | 'joke' | 'suggestion' | 'streak' | 'music' | 'activity' | 'weather' | 'book'
  metadata?: {
    url?: string
    title?: string
    description?: string
    imageUrl?: string
  }
  timestamp?: string
}

interface ConversationContext {
  lastMood?: number
  topicsDiscussed: Set<string>
  userPreferences: {
    likedMusic?: string[]
    favoriteActivities?: string[]
    readingInterests?: string[]
  }
  conversationFlow: {
    lastTopic?: string
    questionAsked?: boolean
    awaitingResponse?: boolean
  }
}

const motivationalQuotes = [
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Every day is a new beginning.",
  "You are stronger than you think.",
  "Small progress is still progress.",
  "Your potential is endless.",
  "Focus on the step in front of you, not the whole staircase.",
  "You've survived all your difficult days so far.",
  "The darkest hour has only sixty minutes.",
  "Every accomplishment starts with the decision to try.",
  "You are capable of amazing things.",
  "Your attitude determines your direction.",
]

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "What did the grape say when it got stepped on? Nothing, it just let out a little wine!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why did the cookie go to the doctor? Because it was feeling crumbly!",
  "What do you call a fake noodle? An impasta!",
  "Why did the math book look sad? Because it had too many problems!",
  "What do you call a can opener that doesn't work? A can't opener!",
  "What do you call a factory that makes okay products? A satisfactory!",
  "Why don't eggs tell jokes? They'd crack up!",
]

interface SuggestionsByMood {
  low: string[]
  medium: string[]
  high: string[]
}

const moodSuggestions: SuggestionsByMood = {
  low: [
    "Try taking a short walk outside",
    "Listen to your favorite uplifting music",
    "Call a friend or family member",
    "Practice deep breathing for 5 minutes",
    "Write down three things you're grateful for",
    "Take a relaxing bath or shower",
    "Watch a funny video or movie",
    "Try some gentle stretching or yoga",
    "Make yourself a comforting hot drink",
    "Color or doodle for a few minutes",
  ],
  medium: [
    "Consider starting a new hobby",
    "Plan something fun for the weekend",
    "Try a new recipe",
    "Organize your space",
    "Do some light exercise",
    "Start a new book",
    "Learn something new online",
    "Connect with an old friend",
    "Try meditation or mindfulness",
    "Write in a journal",
  ],
  high: [
    "Share your positive energy with others",
    "Document what made today great",
    "Set a new goal while motivated",
    "Try something challenging",
    "Express gratitude to someone",
    "Start a creative project",
    "Mentor or help someone else",
    "Plan your next adventure",
    "Learn a new skill",
    "Create something meaningful",
  ]
}

const musicSuggestions = {
  low: [
    { title: "Here Comes The Sun", artist: "The Beatles", genre: "Classic Rock" },
    { title: "Don't Stop Believin'", artist: "Journey", genre: "Rock" },
    { title: "Three Little Birds", artist: "Bob Marley", genre: "Reggae" },
  ],
  medium: [
    { title: "Happy", artist: "Pharrell Williams", genre: "Pop" },
    { title: "Walking on Sunshine", artist: "Katrina & The Waves", genre: "Pop" },
    { title: "Good Vibrations", artist: "The Beach Boys", genre: "Classic Rock" },
  ],
  high: [
    { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", genre: "Pop" },
    { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", genre: "Pop/Funk" },
    { title: "Dancing Queen", artist: "ABBA", genre: "Pop" },
  ],
}

const bookSuggestions = {
  low: [
    { title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction" },
    { title: "Man's Search for Meaning", author: "Viktor E. Frankl", genre: "Non-fiction" },
    { title: "The Little Prince", author: "Antoine de Saint-Exupéry", genre: "Fiction" },
  ],
  medium: [
    { title: "The Happiness of Pursuit", author: "Chris Guillebeau", genre: "Self-help" },
    { title: "Big Magic", author: "Elizabeth Gilbert", genre: "Creativity" },
    { title: "Flow", author: "Mihaly Csikszentmihalyi", genre: "Psychology" },
  ],
  high: [
    { title: "The Power of Now", author: "Eckhart Tolle", genre: "Spirituality" },
    { title: "Atomic Habits", author: "James Clear", genre: "Self-improvement" },
    { title: "Think Like a Monk", author: "Jay Shetty", genre: "Personal Development" },
  ],
}

interface ExternalContent {
  type: 'quote' | 'joke' | 'fact' | 'news'
  content: string
  source?: string
}

const moodBasedQuotes = {
  low: [
    "The darkest hour has only sixty minutes.",
    "Rock bottom became the solid foundation on which I rebuilt my life. - J.K. Rowling",
    "In the middle of difficulty lies opportunity. - Albert Einstein",
    "The only way out is through. - Robert Frost",
  ],
  medium: [
    "Progress is progress, no matter how small.",
    "Every day may not be good, but there's something good in every day.",
    "The future depends on what you do today. - Mahatma Gandhi",
    "Life is like riding a bicycle. To keep your balance, you must keep moving. - Albert Einstein",
  ],
  high: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
    "The best way to predict the future is to create it. - Peter Drucker",
    "Your positive action combined with positive thinking results in success. - Shiv Khera",
  ]
}

const conversationStarters = [
  "What's been the highlight of your day so far?",
  "Have you tried anything new recently?",
  "What's something you're looking forward to?",
  "Is there something specific you'd like to talk about?",
  "How has your mood been lately?",
  "What helps you feel better when you're down?",
  "What activities make you feel most energized?",
  "Have you learned anything interesting lately?",
]

const mindfulnessExercises = [
  {
    title: "5-4-3-2-1 Grounding",
    description: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    duration: "5 minutes"
  },
  {
    title: "Box Breathing",
    description: "Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat.",
    duration: "3 minutes"
  },
  {
    title: "Body Scan",
    description: "Close your eyes and focus on each part of your body, from toes to head, noticing any sensations.",
    duration: "10 minutes"
  },
]

interface MessageWithEmoji extends Message {
  emoji?: string
}

// Add emoji mapping for different moods and situations
const emojiMap = {
  veryHappy: ['🌟', '🎉', '✨', '😊', '🥳'],
  happy: ['😊', '😄', '🙂', '😌', '👍'],
  neutral: ['😐', '🤔', '💭', '👋', '💫'],
  sad: ['😔', '💙', '🫂', '🌧️', '🤗'],
  activities: ['🎨', '📚', '🎵', '🏃‍♂️', '✍️'],
  mindfulness: ['🧘‍♂️', '🌿', '🍃', '💆‍♂️', '🌅'],
  support: ['💪', '🤝', '💝', '🎯', '⭐'],
}

// Add more personalized responses
const personalizedResponses = {
  greeting: [
    "Hey there! How's your day shaping up?",
    "Welcome back! Ready to share how you're feeling?",
    "Hi! I'm here to listen and support you.",
    "Great to see you! How's everything going?",
  ],
  encouragement: [
    "You're doing better than you think!",
    "Every small step counts, and you're making progress!",
    "I believe in you - you've got this!",
    "Remember how far you've come already!",
  ],
  celebration: [
    "That's fantastic! You should be really proud!",
    "What a great achievement! Keep it up!",
    "You're absolutely crushing it!",
    "This is what progress looks like! Amazing work!",
  ],
}

// Add time-based greetings
const timeBasedMessages = {
  morning: [
    "Starting the day with self-reflection is wonderful!",
    "Morning! Ready to make today amazing?",
    "A new day brings new opportunities!",
  ],
  afternoon: [
    "Taking a moment to check in - that's great self-care!",
    "Hope your day is going well!",
    "Perfect time for a mindful break!",
  ],
  evening: [
    "Winding down? Let's reflect on your day.",
    "Evening check-ins are a great habit!",
    "How has your day been? I'm here to listen.",
  ],
  night: [
    "Remember to take care of yourself as the day ends.",
    "Reflecting before rest - that's mindful!",
    "Let's end the day on a positive note.",
  ],
}

// Add more activity suggestions
const extendedActivities = {
  creative: [
    "Try drawing or sketching",
    "Write a short story or poem",
    "Start a DIY project",
    "Learn a new craft",
    "Create a photo collage",
  ],
  physical: [
    "Do some gentle stretching",
    "Take a nature walk",
    "Try a new yoga pose",
    "Dance to your favorite song",
    "Practice deep breathing",
  ],
  social: [
    "Call a friend you haven't talked to in a while",
    "Join an online community group",
    "Write a thoughtful message to someone",
    "Share your achievements with others",
    "Participate in a group activity",
  ],
  learning: [
    "Learn a few words in a new language",
    "Watch an educational video",
    "Try a brain puzzle or game",
    "Read about a new topic",
    "Practice a new skill",
  ],
}

// Add variance calculation helper
const calculateVariance = (numbers: number[]): number => {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  const squareDiffs = numbers.map(num => Math.pow(num - mean, 2))
  return squareDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
}

export function MoodChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<MessageWithEmoji[]>([])
  const [input, setInput] = useState('')
  const [streakCount, setStreakCount] = useState(0)
  const [context, setContext] = useState<ConversationContext>({
    topicsDiscussed: new Set(),
    userPreferences: {},
    conversationFlow: {}
  })
  const { moodData } = useMoodStore()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [lastInteraction, setLastInteraction] = useState<Date>()
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [userPreferences, setUserPreferences] = useState({
    preferredActivities: [] as string[],
    favoriteTopics: [] as string[],
    responseStyle: 'default',
  })
  const [chatHistory, setChatHistory] = useState<{
    date: string;
    messages: MessageWithEmoji[];
  }[]>([])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }
  }

  const simulateTyping = async (text: string) => {
    setIsTyping(true)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    setIsTyping(false)
    return text
  }

  const addEmoji = (type: string, mood: number): string => {
    if (mood >= 4) return getRandomItem(emojiMap.veryHappy)
    if (mood >= 3) return getRandomItem(emojiMap.happy)
    if (mood >= 2) return getRandomItem(emojiMap.neutral)
    return getRandomItem(emojiMap.sad)
  }

  const addMessage = async (text: string, sender: 'user' | 'bot', type?: Message['type'], metadata?: Message['metadata']) => {
    if (sender === 'bot') {
      text = await simulateTyping(text)
    }
    
    const mood = context.lastMood || 3
    const emoji = type ? addEmoji(type, mood) : undefined
    
    const newMessage: MessageWithEmoji = {
      id: Math.random().toString(36).substring(7),
      text,
      sender,
      type,
      metadata,
      emoji,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, newMessage])
    updateChatHistory(newMessage)
    setTimeout(scrollToBottom, 100)
  }

  const updateChatHistory = (message: MessageWithEmoji) => {
    const today = formatDate(new Date())
    setChatHistory(prev => {
      const todayHistory = prev.find(h => h.date === today)
      if (todayHistory) {
        return prev.map(h => 
          h.date === today 
            ? { ...h, messages: [...h.messages, message] }
            : h
        )
      }
      return [...prev, { date: today, messages: [message] }]
    })
  }

  const getRandomItem = <T extends any>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  const updateContext = (updates: Partial<ConversationContext>) => {
    setContext(prev => ({
      ...prev,
      ...updates,
      userPreferences: {
        ...prev.userPreferences,
        ...(updates.userPreferences || {})
      },
      conversationFlow: {
        ...prev.conversationFlow,
        ...(updates.conversationFlow || {})
      }
    }))
  }

  const suggestMusic = (mood: 'low' | 'medium' | 'high') => {
    const suggestion = getRandomItem(musicSuggestions[mood])
    addMessage(
      `How about listening to "${suggestion.title}" by ${suggestion.artist}? It's a great ${suggestion.genre} song that might match your mood.`,
      'bot',
      'music'
    )
  }

  const suggestBook = (mood: 'low' | 'medium' | 'high') => {
    const suggestion = getRandomItem(bookSuggestions[mood])
    addMessage(
      `I recommend reading "${suggestion.title}" by ${suggestion.author}. It's a wonderful ${suggestion.genre} book that might resonate with you right now.`,
      'bot',
      'book'
    )
  }

  const generateFollowUpQuestion = (topic: string) => {
    const questions = {
      music: [
        "What kind of music do you usually listen to when you're feeling this way?",
        "Do you have a favorite artist that always lifts your spirits?",
        "Would you like more music suggestions?",
      ],
      activity: [
        "Have you tried any of these activities before?",
        "What activities usually help you feel better?",
        "Would you like to hear about other activities you might enjoy?",
      ],
      book: [
        "What types of books do you enjoy reading?",
        "Have you read any good books lately?",
        "Would you like more book recommendations?",
      ],
      general: [
        "How are you feeling about that?",
        "Would you like to talk more about it?",
        "Is there anything specific you'd like to discuss?",
      ]
    }

    const questionSet = questions[topic as keyof typeof questions] || questions.general
    return getRandomItem(questionSet)
  }

  const calculateStreak = useCallback(() => {
    const today = new Date()
    let streak = 0
    let currentDate = today

    while (true) {
      const dateStr = formatDate(currentDate)
      const dayMoods = moodData[dateStr]
      
      if (!dayMoods) break
      
      const levels = Object.values(dayMoods).map(entry => entry.level)
      const averageMood = levels.reduce((sum, level) => sum + level, 0) / levels.length
      
      if (averageMood < 3) break
      
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }, [moodData])

  const checkMoodPatterns = useCallback(() => {
    const today = new Date()
    const lastWeek = new Array(7).fill(0).map((_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return formatDate(date)
    })

    const weekMoods = lastWeek.map(date => {
      const dayMoods = moodData[date]
      if (!dayMoods) return null
      const levels = Object.values(dayMoods).map(entry => entry.level)
      return levels.reduce((sum, level) => sum + level, 0) / levels.length
    }).filter(Boolean) as number[]

    if (weekMoods.length > 3) {
      const averageMood = weekMoods.reduce((sum, mood) => sum + mood, 0) / weekMoods.length
      const newStreak = calculateStreak()

      if (averageMood <= 2) {
        addMessage(
          "I've noticed you've been feeling down lately. Remember, it's okay to take breaks and do things you enjoy. Here's a suggestion that might help:",
          'bot',
          'warning'
        )
        setTimeout(() => {
          addMessage(getRandomItem(moodSuggestions.low), 'bot', 'suggestion')
          suggestMusic('low')
        }, 500)
      } else if (averageMood >= 4 && weekMoods[0] > weekMoods[weekMoods.length - 1]) {
        addMessage(
          "🎉 Amazing! I've noticed your mood has been improving. Keep up the great work! Whatever you're doing is clearly working. 🌟",
          'bot',
          'celebration'
        )
      }

      if (newStreak > streakCount && newStreak > 2) {
        addMessage(
          `🌟 Incredible! You've maintained positive moods for ${newStreak} days in a row! That's your longest streak yet! 🎉`,
          'bot',
          'streak'
        )
        setStreakCount(newStreak)
      }
    }
  }, [moodData, streakCount, calculateStreak])

  useEffect(() => {
    checkMoodPatterns()
  }, [checkMoodPatterns])

  const analyzeUserInput = (text: string) => {
    const keywords = {
      music: ['music', 'song', 'listen', 'playlist', 'singing', 'dance'],
      book: ['book', 'read', 'reading', 'story', 'novel', 'literature'],
      activity: ['activity', 'do', 'try', 'start', 'begin', 'hobby'],
      gratitude: ['grateful', 'thankful', 'appreciate', 'blessed'],
      help: ['help', 'advice', 'suggestion', 'guide', 'support'],
      negative: ['sad', 'down', 'depressed', 'unhappy', 'tired', 'stressed', 'anxious', 'lonely'],
      positive: ['happy', 'good', 'great', 'wonderful', 'amazing', 'excited', 'joy'],
      mindfulness: ['meditation', 'breathe', 'relax', 'calm', 'peace', 'mindful'],
      exercise: ['workout', 'exercise', 'run', 'walk', 'gym', 'fitness'],
      social: ['friend', 'family', 'people', 'talk', 'meet', 'social'],
      work: ['work', 'job', 'career', 'study', 'school', 'project'],
      sleep: ['tired', 'sleep', 'rest', 'exhausted', 'nap', 'insomnia'],
      food: ['eat', 'food', 'hungry', 'meal', 'diet', 'nutrition'],
    }

    const topics = Object.entries(keywords).reduce((acc, [topic, words]) => {
      if (words.some(word => text.toLowerCase().includes(word))) {
        acc.push(topic)
      }
      return acc
    }, [] as string[])

    // Update user preferences based on topics
    if (topics.length > 0) {
      setUserPreferences(prev => ({
        ...prev,
        favoriteTopics: Array.from(new Set([...prev.favoriteTopics, ...topics]))
      }))
    }

    return topics
  }

  const getMoodBasedResponse = async (text: string) => {
    setLastInteraction(new Date())
    const topics = analyzeUserInput(text)
    
    if (!moodData[formatDate(new Date())] && !context.lastMood) {
      updateContext({ conversationFlow: { questionAsked: true } })
      return "How are you feeling today? You can share your mood with me anytime."
    }

    const levels = moodData[formatDate(new Date())] 
      ? Object.values(moodData[formatDate(new Date())]).map(entry => entry.level)
      : []
    const averageMood = levels.length > 0
      ? levels.reduce((sum, level) => sum + level, 0) / levels.length
      : context.lastMood || 3

    updateContext({ lastMood: averageMood })

    if (topics.includes('music')) {
      const moodCategory = averageMood <= 2 ? 'low' : averageMood >= 4 ? 'high' : 'medium'
      suggestMusic(moodCategory)
      updateContext({ 
        topicsDiscussed: new Set([...context.topicsDiscussed, 'music']),
        conversationFlow: { lastTopic: 'music', questionAsked: true }
      })
      return generateFollowUpQuestion('music')
    }

    if (topics.includes('book')) {
      const moodCategory = averageMood <= 2 ? 'low' : averageMood >= 4 ? 'high' : 'medium'
      suggestBook(moodCategory)
      updateContext({
        topicsDiscussed: new Set([...context.topicsDiscussed, 'book']),
        conversationFlow: { lastTopic: 'book', questionAsked: true }
      })
      return generateFollowUpQuestion('book')
    }

    if (topics.includes('negative') || averageMood <= 2) {
      setTimeout(() => {
        addMessage(getRandomItem(moodSuggestions.low), 'bot', 'suggestion')
        if (!context.topicsDiscussed.has('music')) {
          suggestMusic('low')
        }
      }, 1000)
      updateContext({ conversationFlow: { lastTopic: 'mood', questionAsked: true } })
      return getRandomItem(motivationalQuotes)
    }

    if (topics.includes('help')) {
      const moodCategory = averageMood <= 2 ? 'low' : averageMood >= 4 ? 'high' : 'medium'
      const suggestions = moodSuggestions[moodCategory]
      updateContext({ conversationFlow: { lastTopic: 'help', questionAsked: true } })
      return getRandomItem(suggestions)
    }

    if (text.toLowerCase().includes('joke')) {
      updateContext({ conversationFlow: { lastTopic: 'joke', questionAsked: true } })
      return getRandomItem(jokes)
    }

    if (topics.includes('positive') || averageMood >= 4) {
      setTimeout(() => {
        addMessage(getRandomItem(moodSuggestions.high), 'bot', 'suggestion')
        if (!context.topicsDiscussed.has('activity')) {
          const activity = getRandomItem(moodSuggestions.high)
          addMessage(activity, 'bot', 'activity')
        }
      }, 1000)
      updateContext({ conversationFlow: { lastTopic: 'mood', questionAsked: true } })
      return "It's wonderful to see you in such good spirits! Your positive energy is contagious! 🌟"
    }

    if (!context.conversationFlow.questionAsked) {
      updateContext({ conversationFlow: { questionAsked: true } })
      return generateFollowUpQuestion('general')
    }

    if (topics.includes('mindfulness')) {
      suggestMindfulness()
      return "Mindfulness can be a great way to center yourself and improve your mood."
    }

    return "I'm here to chat and support you. How can I help make your day better?"
  }

  const handleSend = () => {
    if (!input.trim()) return

    addMessage(input, 'user')
    setInput('')

    setTimeout(() => {
      getMoodBasedResponse(input).then(response => {
        addMessage(response, 'bot')
      })
    }, 500)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  useEffect(() => {
    const checkInactivity = () => {
      if (lastInteraction) {
        const timeSinceLastInteraction = Date.now() - lastInteraction.getTime()
        if (timeSinceLastInteraction > 5 * 60 * 1000) { // 5 minutes
          addMessage(getRandomItem(conversationStarters), 'bot')
        }
      }
    }

    const interval = setInterval(checkInactivity, 60 * 1000)
    return () => clearInterval(interval)
  }, [lastInteraction])

  const suggestMindfulness = () => {
    const exercise = getRandomItem(mindfulnessExercises)
    addMessage(
      "Would you like to try a quick mindfulness exercise?",
      'bot',
      'suggestion',
      {
        title: exercise.title,
        description: exercise.description,
      }
    )
  }

  const analyzeMoodTrend = useCallback(() => {
    const today = new Date()
    const lastMonth = new Array(30).fill(0).map((_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return formatDate(date)
    })

    const monthMoods = lastMonth.map(date => {
      const dayMoods = moodData[date]
      if (!dayMoods) return null
      const levels = Object.values(dayMoods).map(entry => entry.level)
      return levels.reduce((sum, level) => sum + level, 0) / levels.length
    }).filter(Boolean) as number[]

    if (monthMoods.length > 7) {
      const recentMoods = monthMoods.slice(0, 7)
      const moodVariance = calculateVariance(recentMoods)
      
      if (moodVariance > 1.5) {
        addMessage(
          "I've noticed your mood has been quite variable lately. Would you like to explore some stability-building activities?",
          'bot',
          'suggestion'
        )
        suggestMindfulness()
      }
      
      const mostFrequentMood = getMostFrequentMood(recentMoods)
      updateContext({
        lastMood: mostFrequentMood,
        conversationFlow: { lastTopic: 'mood-pattern' }
      })
    }
  }, [moodData])

  useEffect(() => {
    analyzeMoodTrend()
  }, [analyzeMoodTrend])

  // Get most frequent mood
  const getMostFrequentMood = (moods: number[]) => {
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    return Number(Object.entries(moodCounts)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0])
  }

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 
                     hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl 
                     transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-6 z-50 w-80"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Card className="border border-black/10 bg-white/95 backdrop-blur-sm shadow-xl">
              <div className="p-4 border-b border-black/10">
                <h3 className="text-lg font-semibold">Mood Chat</h3>
                <p className="text-sm text-gray-500">I'm here to support you!</p>
              </div>

              <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2",
                          message.sender === 'user'
                            ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                            : "bg-gray-100",
                          message.type === 'warning' && "bg-yellow-50 border border-yellow-200",
                          message.type === 'celebration' && "bg-green-50 border border-green-200",
                          message.type === 'quote' && "bg-blue-50 border border-blue-200",
                          message.type === 'joke' && "bg-pink-50 border border-pink-200",
                          message.type === 'suggestion' && "bg-indigo-50 border border-indigo-200",
                          message.type === 'streak' && "bg-amber-50 border border-amber-200",
                          message.type === 'music' && "bg-purple-50 border border-purple-200",
                          message.type === 'book' && "bg-teal-50 border border-teal-200",
                          message.type === 'activity' && "bg-blue-50 border border-blue-200"
                        )}
                      >
                        {message.type === 'warning' && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mb-1" />
                        )}
                        {message.type === 'celebration' && (
                          <PartyPopper className="w-4 h-4 text-green-500 mb-1" />
                        )}
                        {message.type === 'suggestion' && (
                          <Brain className="w-4 h-4 text-indigo-500 mb-1" />
                        )}
                        {message.type === 'streak' && (
                          <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
                        )}
                        {message.type === 'music' && (
                          <Music className="w-4 h-4 text-purple-500 mb-1" />
                        )}
                        {message.type === 'book' && (
                          <Book className="w-4 h-4 text-teal-500 mb-1" />
                        )}
                        {message.type === 'activity' && (
                          <Sun className="w-4 h-4 text-blue-500 mb-1" />
                        )}
                        <div className="flex items-center gap-2">
                          {message.emoji && <span className="text-lg">{message.emoji}</span>}
                          <p className={cn(
                            "text-sm",
                            message.sender === 'user' ? "text-white" : "text-gray-800"
                          )}>
                            {message.text}
                          </p>
                        </div>
                        {message.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {message.metadata.title && (
                              <p className="font-semibold">{message.metadata.title}</p>
                            )}
                            {message.metadata.description && (
                              <p>{message.metadata.description}</p>
                            )}
                            {message.timestamp && (
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistance(new Date(message.timestamp), new Date(), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-black/10">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    className="bg-gradient-to-r from-violet-500 to-purple-500 
                             hover:from-violet-600 hover:to-purple-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 