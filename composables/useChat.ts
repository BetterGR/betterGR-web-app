import { useUser } from './useUser.js'
import { useAuth } from './useAuth.js'
import { useChatStore } from '~/stores/chat.js'
import { computed } from 'vue'

export interface ChatResponse {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  sessionId?: string
  isPartial?: boolean
  isComplete?: boolean
  isStreaming?: boolean
  metadata?: Record<string, any>
  error?: string
}

export function useChat() {
  const chatStore = useChatStore()
  const { user } = useUser() 
  const { token } = useAuth()

  async function sendMessage(message: string) {
    try {
      chatStore.setLoading(true)
      
      // Add user message to store
      const userMessage = chatStore.addMessage({
        role: 'user',
        content: message,
      })

      await handleStreamingResponse(message)
    } catch (error) {
      console.error('Error sending message:', error)
      chatStore.addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
      })
    } finally {
      chatStore.setLoading(false)
      chatStore.setStreaming(false)
    }
  }

  async function handleStreamingResponse(message: string) {
    chatStore.setStreaming(true)
    
    // Add initial assistant message
    let assistantMessage = chatStore.addMessage({
      role: 'assistant',
      content: '',
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({
          message,
          userId: user.value?.id,
          userRole: user.value?.role,
          conversationHistory: chatStore.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()

        if (done) {
          if (buffer.trim()) {
            console.warn('Stream ended with unparsed data:', buffer)
          }
          break
        }

        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice('data: '.length).trim()
            
            if (data === '[DONE]') {
              return
            }

            try {
              const jsonData: ChatResponse = JSON.parse(data)
              
              if (jsonData.error) {
                console.error('Stream error:', jsonData.error)
                chatStore.addMessage({
                  role: 'assistant',
                  content: `Sorry, I encountered an error: ${jsonData.error}. Please try again.`,
                })
                break
              }

              if (jsonData.content) {
                if (assistantMessage && assistantMessage.role === 'assistant') {
                  assistantMessage.content += jsonData.content
                }
              }
            } catch (parseError) {
              console.warn('Error parsing JSON:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      throw error
    }
  }

  function clearChat() {
    chatStore.clearMessages()
  }

  // Update course context when navigating
  function updateCourseContext(courseId: string | null) {
    chatStore.updateCourseContext(courseId)
  }

  return {
    sendMessage,
    clearChat,
    updateCourseContext,
    isLoading: computed(() => chatStore.isLoading),
    isStreaming: computed(() => chatStore.isStreaming),
    messages: computed(() => chatStore.messages),
    hasMessages: computed(() => chatStore.hasMessages),
    sessionId: computed(() => chatStore.sessionId),
    context: computed(() => chatStore.context),
  }
}