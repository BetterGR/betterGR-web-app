import { defineStore } from 'pinia'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatContext {
  userId?: string
  userRole?: string
  courseId?: string
  sessionId: string
}

export interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  isStreaming: boolean
  sessionId: string
  context: ChatContext
}

// Simple session ID generator
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Simple persistence helpers
function loadFromStorage(): Partial<ChatState> {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem('chat-store')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert timestamp strings back to Date objects
      if (parsed.messages) {
        parsed.messages = parsed.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }
      return parsed
    }
  } catch (error) {
    console.warn('Failed to load chat from storage:', error)
  }
  return {}
}

function saveToStorage(state: ChatState) {
  if (typeof window === 'undefined') return
  
  try {
    const toSave = {
      messages: state.messages,
      sessionId: state.sessionId,
      context: state.context
    }
    localStorage.setItem('chat-store', JSON.stringify(toSave))
  } catch (error) {
    console.warn('Failed to save chat to storage:', error)
  }
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => {
    const stored = loadFromStorage()
    return {
      messages: stored.messages || [],
      isOpen: false,
      isLoading: false,
      isStreaming: false,
      sessionId: stored.sessionId || generateSessionId(),
      context: stored.context || {
        sessionId: stored.sessionId || generateSessionId(),
        userId: undefined,
        userRole: undefined,
        courseId: undefined,
      },
    }
  },

  getters: {
    hasMessages: (state) => state.messages.length > 0,
    lastMessage: (state) => state.messages[state.messages.length - 1] || null,
    chatHistory: (state) => state.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
  },

  actions: {
    // Initialize context with user data
    initializeContext(userData: { userId?: string; userRole?: string; courseId?: string }) {
      this.context = {
        ...this.context,
        ...userData,
        sessionId: this.sessionId,
      }
      saveToStorage(this.$state)
    },

    // Update course context (when user navigates to different course)
    updateCourseContext(courseId: string | null) {
      this.context.courseId = courseId || undefined
      saveToStorage(this.$state)
    },

    toggleChat() {
      this.isOpen = !this.isOpen
    },

    openChat() {
      this.isOpen = true
    },

    closeChat() {
      this.isOpen = false
    },

    addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date(),
      }
      this.messages.push(newMessage)
      saveToStorage(this.$state)
      return newMessage
    },

    updateLastMessage(content: string) {
      if (this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.content = content
          saveToStorage(this.$state)
        }
      }
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setStreaming(streaming: boolean) {
      this.isStreaming = streaming
    },

    clearMessages() {
      this.messages = []
      // Generate new session when clearing
      this.sessionId = generateSessionId()
      this.context.sessionId = this.sessionId
      saveToStorage(this.$state)
    },

    // Start new chat session
    startNewSession() {
      this.clearMessages()
    },
  },
}) 