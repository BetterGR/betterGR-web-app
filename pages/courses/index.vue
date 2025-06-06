<template>
  <div class="container py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">My Courses</h1>
    </div>

    <!-- Authentication check -->
    <div v-if="!isAuthenticated" class="text-center p-8 border rounded bg-yellow-50">
      <p class="text-yellow-700">Please log in to view your courses.</p>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="text-center p-8">
      <div class="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
      <p>Loading courses...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center p-8 border rounded bg-red-50">
      <p class="text-red-600 mb-4">Error loading courses: {{ error.message }}</p>
      <button @click="fetchCourses" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Try Again
      </button>
    </div>

    <!-- Courses grid -->
    <div v-else-if="courses.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink 
        v-for="course in courses" 
        :key="course.id"
        :to="`/courses/${course.slug}`"
        class="group flex flex-col border rounded-lg overflow-hidden hover:border-primary focus:border-primary hover:bg-muted/20 transition-colors"
      >
        <div class="bg-muted/40 p-6 flex items-center gap-4">
          <div class="rounded-lg bg-primary/10 p-3 text-primary">
            <BookOpen class="h-5 w-5" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold tracking-tight">{{ course.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ course.id }}</p>
          </div>
        </div>
        
        <div class="p-6 flex-1 flex flex-col justify-between">
          <!-- Course Description -->
          <div class="mb-4">
            <p v-if="course.description" class="text-sm text-muted-foreground leading-relaxed description-text">
              {{ course.description }}
            </p>
            <p v-else class="text-sm text-muted-foreground italic">
              No description available.
            </p>
          </div>
          
          <!-- Course Details -->
          <div class="text-sm text-muted-foreground space-y-2 mt-auto">
            <div class="flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              <span>{{ course.semester }}</span>
            </div>
            <div class="flex items-center gap-2">
              <User class="h-4 w-4" />
              <span>ID: {{ course.id }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                Slug: {{ course.slug }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center p-8 border rounded bg-gray-50 dark:bg-gray-800">
      <p class="text-gray-600 dark:text-gray-300">No courses found.</p>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, Calendar, User } from 'lucide-vue-next'
import { useCourses } from '~/composables/useCourses'
import { useAuth } from '~/composables/useAuth'

// Authentication
const { isAuthenticated } = useAuth()

// Courses from GraphQL
const { courses, loading, error, fetchCourses } = useCourses()

// Auto-load courses if authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    fetchCourses()
  }
})
</script>

<style scoped>
.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 4.5rem;
}
</style>