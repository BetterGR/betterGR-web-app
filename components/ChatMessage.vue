<template>
  <div 
    class="flex gap-3 group"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <!-- Avatar -->
    <div 
      v-if="message.role === 'assistant'"
      class="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
    >
      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Message bubble -->
    <div 
      class="max-w-[80%] rounded-lg px-4 py-2 relative"
      :class="messageClasses"
    >
      <!-- User message - plain text -->
      <div v-if="message.role === 'user'" class="text-sm">
        {{ message.content }}
      </div>

      <!-- Assistant message - with basic markdown formatting -->
      <div v-else class="text-sm">
        <div v-if="isLoading" class="text-muted-foreground">
          <div class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
            <span class="text-xs">Thinking...</span>
          </div>
        </div>
        <div v-else class="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-foreground" v-html="formattedContent"></div>
      </div>

      <!-- Timestamp -->
      <div 
        class="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {{ formatTime(message.timestamp) }}
      </div>
    </div>

    <!-- User avatar -->
    <div 
      v-if="message.role === 'user'"
      class="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center"
    >
      <svg class="w-4 h-4 text-secondary-foreground" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '~/stores/chat'

interface Props {
  message: ChatMessage
  isLoading?: boolean
}

const props = defineProps<Props>()

// Simple markdown formatting
const formattedContent = computed(() => {
  if (props.message.role === 'user') return props.message.content
  
  let content = props.message.content
  
  // Basic markdown to HTML conversion
  content = content
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Code blocks (basic)
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
  
  // Wrap in paragraph if not already wrapped
  if (!content.includes('<p>') && !content.includes('<ul>')) {
    content = `<p>${content}</p>`
  }
  
  return content
})

// Message styling based on role
const messageClasses = computed(() => {
  if (props.message.role === 'user') {
    return 'bg-primary text-primary-foreground'
  } else {
    return 'bg-muted border'
  }
})

// Format timestamp
function formatTime(timestamp: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(timestamp)
}
</script>

<style scoped>
/* Ensure text is visible in dark mode */
.dark .prose p,
.dark .prose div,
.dark .prose span,
.dark .prose li,
.dark .prose strong,
.dark .prose em {
  color: rgb(229, 231, 235) !important; /* text-gray-200 */
}

/* Code blocks in dark mode */
.dark .prose code {
  background-color: rgba(55, 65, 81, 0.5) !important; /* bg-gray-700/50 */
  color: rgb(229, 231, 235) !important; /* text-gray-200 */
}

/* Links in dark mode */
.dark .prose a {
  color: rgb(96, 165, 250) !important; /* text-blue-400 */
}

/* Light mode text colors */
.prose p,
.prose div, 
.prose span,
.prose li,
.prose strong,
.prose em {
  color: rgb(55, 65, 81) !important; /* text-gray-700 */
}
</style>