<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-6 py-12">
      <!-- Authentication Status Banner -->
      <AuthStatusBanner 
        :checking="checking" 
        :is-authenticated="isAuthenticated" 
        @login="login"
      />

      <!-- Main Content - Only Show When Authenticated -->
      <Dashboard 
        v-if="isAuthenticated"
        :username="username"
        :current-semester="currentSemester"
        :filtered-courses="filteredCourses"
        :upcoming-assignments="upcomingAssignments"
        :pending="pending"
        :upcoming="upcoming"
        :loading-courses="loadingCourses"
        :courses-error="coursesError"
        @retry-courses="retryCourses"
      />
      
      <!-- Placeholder content when checking and not authenticated yet -->
      <div v-if="checking && !isAuthenticated" class="animate-pulse">
        <div class="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8"></div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div class="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div class="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div class="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { useDashboard } from '~/composables/useDashboard'
import AuthStatusBanner from '~/components/AuthStatusBanner.vue'
import Dashboard from '~/components/Dashboard.vue'

const router = useRouter()
const route = useRoute()

// Use the dashboard composable
const { 
  checking, 
  isAuthenticated, 
  username, 
  login,
  currentSemester,
  filteredCourses,
  upcomingAssignments,
  pending,
  upcoming,
  loadingCourses,
  coursesError,
  fetchCourses
} = useDashboard()

// Function to retry fetching courses
const retryCourses = () => {
  fetchCourses();
};

// Watch for authentication state changes
watch(isAuthenticated, (newValue) => {
  // If authenticated and on the home page, check if there's a redirect path
  if (newValue && route.path === '/') {
    const redirectPath = sessionStorage.getItem('login_redirect_path')
    if (redirectPath) {
      sessionStorage.removeItem('login_redirect_path')
      router.push(redirectPath)
    }
  }
  // If not authenticated and not on home or callback, redirect to home
  else if (!newValue && route.path !== '/' && route.path !== '/callback') {
    router.push('/')
  }
})

// When the page loads, check if we need to restore authentication
onMounted(() => {
  // Add a small timeout to ensure Keycloak has fully initialized
  setTimeout(() => {
    // Get the auth composable and check if we need to restore authentication
    import('~/composables/useAuth').then(({ useAuth }) => {
      const auth = useAuth();
      if (!isAuthenticated.value) {
        auth.checkAuthentication();
      }
    });
  }, 500);
})
</script>