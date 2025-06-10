<template>
  <!-- Use ClientOnly to prevent hydration mismatch -->
  <ClientOnly>
    <!-- Only show chat if user is authenticated -->
    <div v-if="isUserAuthenticated" class="fixed bottom-6 right-6 z-50">
      <!-- Chat Button -->
      <button
        v-if="!chatStore.isOpen"
        @click="chatStore.openChat"
        class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        :class="{ 'animate-pulse': hasUnreadMessages }"
      >
        <MessageCircle class="w-6 h-6" />
        <span v-if="hasUnreadMessages" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          !
        </span>
      </button>

      <!-- Chat Window -->
      <div
        v-if="chatStore.isOpen"
        class="bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden transition-all duration-300"
        :class="isFullscreen ? 'fixed inset-4 w-auto h-auto' : 'w-96 h-[600px]'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b bg-muted/30">
          <div class="flex items-center gap-2">
            <MessageCircle class="w-5 h-5 text-primary" />
            <h3 class="font-semibold text-sm">Chat Assistant</h3>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="toggleFullscreen"
              class="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
              :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
            >
              <Maximize2 v-if="!isFullscreen" class="w-4 h-4" />
              <Minimize2 v-else class="w-4 h-4" />
            </button>
            <button
              @click="clearChat"
              class="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Clear chat"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <button
              @click="chatStore.closeChat"
              class="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-4"
        >
          <!-- Welcome message -->
          <div v-if="!chatStore.hasMessages" class="text-center text-muted-foreground text-sm py-8">
            <MessageCircle class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Welcome! How can I assist you today?</p>
          </div>

          <!-- Messages -->
          <ChatMessage
            v-for="message in chatStore.messages"
            :key="message.id"
            :message="message"
            :is-loading="chatStore.isLoading && message === chatStore.lastMessage"
          />

          <!-- Typing indicator -->
          <div v-if="chatStore.isStreaming" class="flex justify-start">
            <div class="bg-muted border rounded-lg px-4 py-2 max-w-[80%]">
              <div class="flex items-center gap-1">
                <div class="flex space-x-1">
                  <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="border-t p-4">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              class="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
              :disabled="chatStore.isLoading"
              @keydown.enter.prevent="sendMessage"
            />
            <button
              type="submit"
              :disabled="!newMessage.trim() || chatStore.isLoading"
              class="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send class="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Chat button for unauthenticated users -->
    <div v-else-if="!showAuthPrompt" class="fixed bottom-6 right-6 z-50">
      <button
        @click="handleAuthPrompt"
        class="bg-muted/90 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 border"
        title="Chat Assistant (Login Required)"
      >
        <MessageCircle class="w-6 h-6" />
      </button>
    </div>
    
    <!-- Chat Window -->
    <div
      v-if="chatStore.isOpen"
      class="bg-background border rounded-lg shadow-xl w-96 h-[600px] flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b bg-muted/30">
        <div class="flex items-center gap-2">
          <MessageCircle class="w-5 h-5 text-primary" />
          <h3 class="font-semibold text-sm">Chat Assistant</h3>
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="clearChat"
            class="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Clear chat"
          >
            <Trash2 class="w-4 h-4" />
          </button>
          <button
            @click="chatStore.closeChat"
            class="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <!-- Welcome message -->
        <div v-if="!chatStore.hasMessages" class="text-center text-muted-foreground text-sm py-8">
          <MessageCircle class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Welcome! How can I assist you today?</p>
        </div>

        <!-- Messages -->
        <ChatMessage
          v-for="message in chatStore.messages"
          :key="message.id"
          :message="message"
          :is-loading="chatStore.isLoading && message === chatStore.lastMessage"
        />

        <!-- Typing indicator -->
        <div v-if="chatStore.isStreaming" class="flex justify-start">
          <div class="bg-muted border rounded-lg px-4 py-2 max-w-[80%]">
            <div class="flex items-center gap-1">
              <div class="flex space-x-1">
                <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t p-4">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type a message..."
            class="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 bg-background text-foreground dark:bg-input dark:text-foreground"
            :disabled="chatStore.isLoading"
            @keydown.enter.prevent="sendMessage"
          />
          <button
            type="submit"
            :disabled="!newMessage.trim() || chatStore.isLoading"
            class="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send class="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { MessageCircle, X, Trash2, Send, Maximize2, Minimize2 } from 'lucide-vue-next'
import { useChatStore } from '~/stores/chat'
import { useChat } from '~/composables/useChat'
import { useAuth } from '~/composables/useAuth'

// Store and composables
const chatStore = useChatStore()
const { sendMessage: sendChatMessage, clearChat: clearChatMessages } = useChat()
const { isAuthenticated, login } = useAuth()

// Local state
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const hasUnreadMessages = ref(false)
const isFullscreen = ref(false)
const showAuthPrompt = ref(false)

// Authentication state
const isUserAuthenticated = computed(() => isAuthenticated.value)

// Show auth prompt when user tries to access chat without being authenticated
const handleAuthPrompt = () => {
  showAuthPrompt.value = true
}

const hideAuthPrompt = () => {
  showAuthPrompt.value = false
}

const handleLogin = () => {
  hideAuthPrompt()
  login()
}

// Toggle fullscreen
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // Scroll to bottom after fullscreen toggle
  nextTick(() => {
    scrollToBottom()
  })
}

// Auto-scroll to bottom when new messages arrive
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watch for new messages and auto-scroll
watch(
  () => chatStore.messages,
  () => {
    scrollToBottom()
    if (!chatStore.isOpen && chatStore.hasMessages) {
      hasUnreadMessages.value = true
    }
  },
  { deep: true }
)

// Clear unread indicator when chat is opened
watch(
  () => chatStore.isOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      hasUnreadMessages.value = false
      scrollToBottom()
    } else {
      // Reset fullscreen when chat is closed
      isFullscreen.value = false
    }
  }
)

// Send message function - now sends entire chat history to GraphQL
const sendMessage = async () => {
  const message = newMessage.value.trim()
  if (!message || chatStore.isLoading) return

  newMessage.value = ''
  
  try {
    await sendChatMessage(message)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

// Clear chat function
const clearChat = () => {
  clearChatMessages()
  hasUnreadMessages.value = false
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // ESC to exit fullscreen
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
  // ESC to hide auth prompt
  if (event.key === 'Escape' && showAuthPrompt.value) {
    hideAuthPrompt()
  }
  // F11 to toggle fullscreen (when chat is open)
  if (event.key === 'F11' && chatStore.isOpen) {
    event.preventDefault()
    toggleFullscreen()
  }
}

// Lifecycle
onMounted(() => {
  scrollToBottom()
  // Add keyboard event listener
  document.addEventListener('keydown', handleKeydown)
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Ensure input is visible in dark mode */
.dark input[type="text"] {
  background-color: hsl(var(--input)) !important;
  color: hsl(var(--foreground)) !important;
  border-color: hsl(var(--border)) !important;
}

.dark input[type="text"]::placeholder {
  color: hsl(var(--muted-foreground)) !important;
}

/* Light mode input */
input[type="text"] {
  background-color: hsl(var(--background)) !important;
  color: hsl(var(--foreground)) !important;
}

input[type="text"]::placeholder {
  color: hsl(var(--muted-foreground)) !important;
}
</style>