<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Admin Header (only shown on admin pages) -->
    <div v-if="isAdminPage" class="bg-card border-b border-border">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-primary">BetterGR Admin</h1>
            <div class="text-sm text-muted-foreground">
              Staff Portal
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- User Info -->
            <div class="text-sm text-muted-foreground">
              Welcome, {{ auth.userName.value }}
            </div>
            
            <!-- Return to Student View -->
            <button
              @click="navigateTo('/')"
              class="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
            >
              Student View
            </button>
            
            <!-- Logout -->
            <button
              @click="auth.logout()"
              class="px-3 py-1.5 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Regular Header (hidden on admin pages) -->
    <TheHeader v-else />
    
    <main class="flex-1 px-8 md:px-16 mx-auto w-full max-w-[1600px]">
      <slot />
    </main>
    
    <!-- Mini Chat Widget (hidden on admin pages) -->
    <MiniChat v-if="!isAdminPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { navigateTo } from 'nuxt/app'

const route = useRoute()
const auth = useAuth()

// Check if current page is an admin page
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin')
})
</script>
