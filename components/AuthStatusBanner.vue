<template>
  <div>
    <!-- Authentication Status Banner (small indicator) -->
    <div v-if="checking" class="fixed top-4 right-4 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-md shadow-md z-50 flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Checking authentication...
    </div>

    <!-- Authentication Required Banner -->
    <div v-if="!isAuthenticated && !checking" class="mb-8 p-6 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-center">
      <h2 class="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Authentication Required</h2>
      <p class="text-red-700 dark:text-red-300 mb-4">You need to be logged in to access this application.</p>
      <button 
        @click="handleLogin"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="checking"
      >
        <span v-if="checking" class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
        {{ checking ? 'Checking...' : 'Login' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define props
const props = defineProps<{
  checking: boolean;
  isAuthenticated: boolean;
}>();

// Define emits
const emit = defineEmits<{
  (e: 'login'): void;
}>();

// Handle login
const handleLogin = () => {
  emit('login')
}
</script> 