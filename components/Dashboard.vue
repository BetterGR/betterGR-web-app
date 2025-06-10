<template>
  <div>
    <!-- Header Section -->
    <WelcomeBanner 
      :semester-name="currentSemester.name" 
    />
    
    <!-- Dashboard Metrics Overview -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <DashboardMetrics 
        :courses-count="filteredCourses.length"
        :pending-assignments="pending"
        :upcoming-deadlines="upcoming"
      />
    </div>

    <!-- Recent Announcements Section -->
    <section class="mb-8">
      <RecentAnnouncements :filtered-courses="filteredCourses" />
    </section>
    
    <!-- Upcoming Assignments Section -->
    <section class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold tracking-tight">Upcoming Assignments</h2>
        <NuxtLink to="/assignments" class="text-sm text-primary hover:underline">View all</NuxtLink>
      </div>
      
      <div class="rounded-lg border bg-card">
        <!-- Assignments Table Header -->
        <div v-if="upcomingAssignments.length > 0">
          <div class="p-4 border-b grid grid-cols-12 items-center">
            <div class="col-span-5">Assignment</div>
            <div class="col-span-3">Course</div>
            <div class="col-span-2">Due Date</div>
            <div class="col-span-2">Status</div>
          </div>
          
          <!-- Assignments Table Rows -->
          <div 
            v-for="assignment in upcomingAssignments" 
            :key="assignment.id" 
            class="p-4 border-b last:border-b-0 grid grid-cols-12 items-center"
          >
            <!-- Assignment Details -->
            <div class="col-span-5">
              <div class="font-medium">{{ assignment.title }}</div>
              <div class="text-sm text-muted-foreground line-clamp-1">{{ assignment.description }}</div>
            </div>
            
            <!-- Course, Due Date and Status -->
            <div class="col-span-3 text-sm">{{ assignment.course }}</div>
            <div class="col-span-2 text-sm">{{ assignment.dueDate }}</div>
            <div class="col-span-2">
              <span 
                :class="{
                  'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400': assignment.status === 'pending',
                  'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400': assignment.status === 'overdue',
                }"
                class="inline-block rounded-full px-2 py-1 text-xs font-semibold"
              >
                {{ assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="p-6 text-center text-muted-foreground">
          No upcoming assignments for {{ currentSemester.name }}
        </div>
      </div>
    </section>
    
    <!-- Courses Overview Section -->
    <section class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold tracking-tight">My Courses</h2>
        <NuxtLink to="/courses" class="text-sm text-primary hover:underline">View all</NuxtLink>
      </div>
      
      <!-- Loading State -->
      <div v-if="loadingCourses" class="p-6 bg-card rounded-lg">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span class="ml-3 text-sm text-muted-foreground">Loading your courses...</span>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="coursesError" class="p-6 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
        <p class="font-medium">Error loading courses</p>
        <p class="text-sm mt-1">{{ coursesError.message }}</p>
        <button 
          class="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-800/40 rounded-md text-sm"
          @click="$emit('retry-courses')"
        >
          Retry
        </button>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredCourses.length === 0" class="p-6 text-center bg-card rounded-lg">
        <p class="text-muted-foreground">No courses found for the current semester.</p>
      </div>
      
      <!-- Course Cards Grid -->
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink 
          v-for="course in filteredCourses.slice(0, 3)" 
          :key="course.id"
          :to="`/courses/${course.slug}`"
          class="rounded-lg border bg-card p-4 hover:border-primary/50 hover:bg-muted/20 transition-colors"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="rounded-md bg-primary/10 p-2">
              <BookOpen class="h-4 w-4 text-primary" />
            </div>
            <div>
              <div class="font-medium">{{ course.title }}</div>
              <div class="text-xs text-muted-foreground">{{ course.code }}</div>
            </div>
          </div>
          <!-- Course Description -->
          <p v-if="course.description" class="text-sm text-muted-foreground mt-2 line-clamp-2">
            {{ course.description }}
          </p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Import components and icons
import { BookOpen } from 'lucide-vue-next'
import WelcomeBanner from '~/components/dashboard/WelcomeBanner.vue'
import DashboardMetrics from '~/components/dashboard/DashboardMetrics.vue'
import RecentAnnouncements from '~/components/dashboard/RecentAnnouncements.vue'

// Define component props
interface Props {
  currentSemester: any
  filteredCourses: any[]
  upcomingAssignments: any[]
  pending: number
  upcoming: number
  loadingCourses: boolean
  coursesError: Error | null
}

const props = defineProps<Props>()

// Define events
defineEmits(['retry-courses']);
</script> 