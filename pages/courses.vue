<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-6 py-12">
      <!-- Header Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Your Courses
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore your enrolled courses and track your academic progress
        </p>
      </div>
      
      <!-- Not authenticated message -->
      <div v-if="!isAuthenticated" class="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">Please log in to view your courses.</p>
        <button @click="login" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Login to Continue
        </button>
      </div>
      
      <!-- Authenticated content -->
      <div v-else>
        <!-- Actions -->
        <div class="flex justify-center mb-8">
          <button 
            @click="fetchCourses" 
            class="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
            :disabled="loading"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Refreshing...' : 'Refresh Courses' }}
          </button>
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div class="flex gap-2">
              <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 max-w-md mx-auto text-center">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Error Loading Courses</h3>
          <p class="text-red-600 dark:text-red-300 mb-4">{{ error.message }}</p>
          <button @click="fetchCourses" class="text-red-600 dark:text-red-400 hover:underline font-medium">
            Try Again
          </button>
        </div>
        
        <!-- Course cards grid -->
        <div v-else-if="courses.length" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="course in courses" :key="course.id" 
              class="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
            
            <!-- Course Header with Gradient -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h2 class="text-xl font-bold mb-1 group-hover:text-blue-100 transition-colors">
                    {{ course.title }}
                  </h2>
                  <p class="text-blue-100 text-sm font-medium">{{ course.code }}</p>
                </div>
                <span class="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                  {{ course.semester }}
                </span>
              </div>
            </div>
            
            <!-- Course Content -->
            <div class="p-6">
              <!-- Course ID -->
              <div class="mb-4">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course ID</span>
                <p class="text-sm font-mono text-gray-800 dark:text-gray-200 mt-1 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded">
                  {{ course.id }}
                </p>
              </div>
              
              <!-- Course Description -->
              <div v-if="course.description" class="mb-6">
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</span>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed line-clamp-3">
                  {{ course.description }}
                </p>
              </div>
              
              <!-- Course Actions -->
              <div class="flex gap-3">
                <NuxtLink 
                  :to="`/courses/${course.slug}`"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  View Course
                </NuxtLink>
                <NuxtLink 
                  :to="`/grades?course=${course.id}`"
                  class="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-center py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Grades
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="!loading" class="text-center py-16">
          <div class="max-w-md mx-auto">
            <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">No Courses Found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">You don't have any courses assigned to your account yet.</p>
            <button @click="fetchCourses" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Refresh Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCourses } from '~/composables/useCourses.js'
import { useAuth } from '~/composables/useAuth.js'

// Get authentication state
const { isAuthenticated, userId, login, logout } = useAuth()

// Get courses functionality
const { courses, loading, error, fetchCourses } = useCourses()

// Auto-load courses when component mounts if authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    fetchCourses()
  }
})
</script> 