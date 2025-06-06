<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 text-sm rounded-full py-1 px-3 hover:bg-gray-200 transition focus:outline-none"
    >
      <div class="rounded-full bg-blue-600 text-white h-8 w-8 flex items-center justify-center">
        <span v-if="!isLoading">
          <ClientOnly>
            {{ userName ? userName.charAt(0).toUpperCase() : '?' }}
          </ClientOnly>
        </span>
        <span v-else>...</span>
      </div>
      <span class="hidden md:inline text-gray-800 font-medium">
        <ClientOnly>
          {{ isLoading ? 'Loading...' : userName || 'Guest' }}
        </ClientOnly>
      </span>
      <ChevronDown class="h-4 w-4 text-gray-600" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20"
    >
      <div class="py-2">
        <div class="px-4 py-2 text-xs text-gray-500">
          <ClientOnly>
            <p v-if="isAuthenticated">Logged in as <span class="font-medium">{{ userName }}</span></p>
            <p v-else>Not logged in</p>
            <p v-if="userId" class="mt-1 truncate">ID: {{ userId }}</p>
          </ClientOnly>
        </div>
        <div class="border-t border-gray-100"></div>
        
        <template v-if="isAuthenticated">
          <button
            @click="handleLogout"
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            <div class="flex items-center gap-2">
              <LogOut class="h-4 w-4" />
              <span>Log out</span>
            </div>
          </button>
        </template>
        <template v-else>
          <button
            @click="handleLogin"
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            <div class="flex items-center gap-2">
              <LogIn class="h-4 w-4" />
              <span>Log in</span>
            </div>
          </button>
        </template>
      </div>
    </div>
    <div
      v-if="isOpen"
      class="fixed inset-0 z-10"
      @click="isOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ChevronDown, LogIn, LogOut } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

// Local reactive state
const isOpen = ref(false)
const isLoading = ref(true)

// Local copies of auth state to prevent hydration mismatch
// These will be updated on client side only
const localUserName = ref('')
const localUserId = ref('')
const localIsAuthenticated = ref(false)

const { login, logout, userName: authUserName, userId: authUserId, isAuthenticated: authIsAuthenticated } = useAuth()

// Computed properties that use local state
const userName = computed(() => localUserName.value)
const userId = computed(() => localUserId.value)
const isAuthenticated = computed(() => localIsAuthenticated.value)

// Update local state from auth state with a slight delay to ensure client-side only
onMounted(() => {
  // Set a small delay to ensure Keycloak is fully initialized
  setTimeout(() => {
    localUserName.value = authUserName.value
    localUserId.value = authUserId.value
    localIsAuthenticated.value = authIsAuthenticated.value
    isLoading.value = false
    
    // Set up a watcher to update local state if auth state changes
    const checkAuthInterval = setInterval(() => {
      localUserName.value = authUserName.value
      localUserId.value = authUserId.value
      localIsAuthenticated.value = authIsAuthenticated.value
    }, 2000)
    
    // Clean up interval on component unmount
    return () => clearInterval(checkAuthInterval)
  }, 500)
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function handleLogin() {
  isOpen.value = false
  login()
}

function handleLogout() {
  isOpen.value = false
  logout()
}
</script> 