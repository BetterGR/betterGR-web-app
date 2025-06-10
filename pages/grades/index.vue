<template>
  <div class="py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight mb-2">Grades</h1>
        <p class="text-muted-foreground">
          View and track your academic performance for {{ currentSemester.name }}
        </p>
      </div>
      <div class="flex items-center">
        <SemesterSelector />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-8">
      <div v-for="i in 3" :key="i" class="rounded-lg border bg-card overflow-hidden animate-pulse">
        <div class="bg-muted/50 p-6 border-b">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div class="p-6">
          <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center p-8 border rounded-lg bg-red-50">
      <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-red-900 mb-2">Error Loading Grades</h3>
      <p class="text-red-700 mb-4">{{ error.message || error }}</p>
      <button 
        @click="fetchGrades" 
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Grades Content -->
    <div v-else-if="courseGrades.length > 0" class="space-y-8">
      <div v-for="courseData in courseGrades" :key="courseData.course.id" class="rounded-lg border bg-card overflow-hidden">
        <div class="bg-muted/50 p-6 border-b">
          <h2 class="text-xl font-semibold">{{ courseData.course.name }}</h2>
          <div class="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <Bookmark class="h-4 w-4" />
              <span>{{ courseData.course.id }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              <span>{{ courseData.course.semester }}</span>
            </div>
            <div class="flex items-center gap-2">
              <GraduationCap class="h-4 w-4" />
              <span>{{ courseData.grades.length }} grades recorded</span>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Overall grade summary -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium mb-1">Course Grades</h3>
              <p class="text-sm text-muted-foreground">All recorded grades for this course</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-blue-600">{{ courseData.grades.length }}</div>
              <div class="text-sm text-muted-foreground">Total Grades</div>
            </div>
          </div>
          
          <!-- Grades table -->
          <div class="border rounded-md">
            <div class="grid grid-cols-12 gap-4 p-4 border-b font-medium text-sm bg-gray-50 dark:bg-gray-800">
              <div class="col-span-3">Grade Type</div>
              <div class="col-span-3">Item ID</div>
              <div class="col-span-2">Value</div>
              <div class="col-span-4">Date</div>
            </div>
            <div v-if="courseData.grades.length > 0">
              <div v-for="grade in courseData.grades" :key="grade.id" class="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                <div class="col-span-3">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium">
                    {{ grade.gradeType }}
                  </span>
                </div>
                <div class="col-span-3 font-mono text-xs text-gray-700 dark:text-gray-300">{{ grade.itemId }}</div>
                <div class="col-span-2">
                  <span class="font-semibold text-lg text-gray-900 dark:text-white">{{ grade.gradeValue }}</span>
                </div>
                <div class="col-span-4 text-gray-500 dark:text-gray-400">
                  {{ formatDate(grade.gradedAt) }}
                  <div v-if="grade.comments" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {{ grade.comments }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="p-8 text-center text-gray-500 dark:text-gray-400">
              <FileText class="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p>No grades recorded for this course yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <GraduationCap class="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">No Grades Found</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">No grades have been recorded for the selected semester.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bookmark, Calendar, GraduationCap, AlertCircle, FileText } from 'lucide-vue-next'
import { useSemesters } from '~/composables/useSemesters'
import { useGrades } from '~/composables/useGrades'
import SemesterSelector from '~/components/SemesterSelector.vue'
import { useHead } from 'nuxt/app'

// Get semester data
const { currentSemester } = useSemesters()

// Get grades data using the composable
const { 
  courses, 
  grades, 
  courseGrades, 
  loading, 
  error, 
  fetchGrades, 
  formatDate 
} = useGrades()

// Page head
useHead({
  title: 'Grades - BetterGR'
})
</script> 