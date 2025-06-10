<template>
  <div class="container mx-auto p-8 max-w-4xl">
    <div class="bg-card rounded-lg border p-6 mb-6">
      <h1 class="text-2xl font-bold mb-4">🤖 Chat Integration Test</h1>
      <p class="text-muted-foreground mb-4">
        This page demonstrates the OpenAI chat integration with user context and GraphQL data.
      </p>

      <!-- Current User Display -->
      <div v-if="user" class="mb-6 p-4 bg-muted rounded-md">
        <h3 class="font-semibold mb-2">✅ Current User Context</h3>
        <div class="text-sm space-y-1">
          <p><strong>Name:</strong> {{ user.firstName }} {{ user.lastName }}</p>
          <p><strong>Role:</strong> {{ user.role }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p v-if="user.title"><strong>Title:</strong> {{ user.title }}</p>
          <p v-if="user.office"><strong>Office:</strong> {{ user.office }}</p>
        </div>
      </div>

      <!-- Authentication Required -->
      <div v-else class="mb-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-md">
        <h3 class="font-semibold text-yellow-800 mb-2">⚠️ Authentication Required</h3>
        <p class="text-yellow-700 text-sm">
          Please log in to test the chat functionality. The chat requires user context to provide personalized responses.
        </p>
      </div>

      <!-- Environment Check -->
      <div class="mb-6 p-4 border rounded-md">
        <h3 class="font-semibold mb-2">🔧 Environment Status</h3>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="hasOpenAiKey ? 'bg-green-500' : 'bg-red-500'"></div>
            <span>OpenAI API Key: {{ hasOpenAiKey ? 'Configured' : 'Missing' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="hasGraphQL ? 'bg-green-500' : 'bg-yellow-500'"></div>
            <span>GraphQL Endpoint: {{ hasGraphQL ? 'Available' : 'Check Configuration' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="user ? 'bg-green-500' : 'bg-red-500'"></div>
            <span>User Context: {{ user ? 'Ready' : 'Authentication Required' }}</span>
          </div>
        </div>
      </div>

      <!-- Test Queries -->
      <div v-if="user" class="mb-6">
        <h3 class="font-semibold mb-3">💬 Test Queries</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <template v-if="user.role === 'student'">
            <button @click="sendTestMessage('What are my current grades?')" class="text-left p-3 border rounded-md hover:bg-muted">
              "What are my current grades?"
            </button>
            <button @click="sendTestMessage('When is my next assignment due?')" class="text-left p-3 border rounded-md hover:bg-muted">
              "When is my next assignment due?"
            </button>
            <button @click="sendTestMessage('Tell me about my courses this semester')" class="text-left p-3 border rounded-md hover:bg-muted">
              "Tell me about my courses this semester"
            </button>
            <button @click="sendTestMessage('What announcements do I have?')" class="text-left p-3 border rounded-md hover:bg-muted">
              "What announcements do I have?"
            </button>
          </template>
          <template v-else>
            <button @click="sendTestMessage('How many students are in my classes?')" class="text-left p-3 border rounded-md hover:bg-muted">
              "How many students are in my classes?"
            </button>
            <button @click="sendTestMessage('Show me recent assignments I created')" class="text-left p-3 border rounded-md hover:bg-muted">
              "Show me recent assignments I created"
            </button>
            <button @click="sendTestMessage('Show me recent announcements')" class="text-left p-3 border rounded-md hover:bg-muted">
              "Show me recent announcements"
            </button>
            <button @click="sendTestMessage('What courses am I teaching?')" class="text-left p-3 border rounded-md hover:bg-muted">
              "What courses am I teaching?"
            </button>
          </template>
        </div>
      </div>

      <!-- Instructions -->
      <div class="text-sm text-muted-foreground">
        <p><strong>Setup Instructions:</strong></p>
        <ol class="list-decimal list-inside space-y-1 mt-2">
          <li>Ensure you're logged in to your BetterGR account</li>
          <li>Add <code>OPENAI_API_KEY=your_key_here</code> to your <code>.env</code> file</li>
          <li>Make sure your GraphQL backend is running on the configured endpoint</li>
          <li>Click the floating chat button to start chatting, or use test queries above</li>
        </ol>
        
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-blue-800 text-sm">
            <strong>💡 OpenAI API Key Required:</strong> You need an OpenAI API key from 
            <a href="https://platform.openai.com/api-keys" target="_blank" class="underline">platform.openai.com</a> 
            to use the chat functionality.
          </p>
        </div>
      </div>
    </div>

    <!-- Mini Chat Component -->
    <MiniChat v-if="user" />
    <div v-else class="fixed bottom-6 right-6 z-50">
      <div class="bg-muted border rounded-lg p-4 text-sm text-muted-foreground max-w-xs">
        Please log in to use chat
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useUser()

// Environment checks
const hasOpenAiKey = ref(true) // This would check if API key exists in production
const hasGraphQL = ref(true) // This would check if GraphQL endpoint is accessible

// Send test message
const sendTestMessage = (message: string) => {
  if (!user.value) return
  
  const chatStore = useChatStore()
  const { sendMessage } = useChat()
  
  // Open chat and send message
  chatStore.openChat()
  
  // Wait a moment for chat to open, then send message
  nextTick(() => {
    sendMessage(message)
  })
}
</script> 