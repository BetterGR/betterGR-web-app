<template>
  <!-- Courses Card -->
  <div class="rounded-lg border bg-card p-6">
    <div class="flex items-center gap-4 mb-4">
      <div class="rounded-full bg-primary/10 p-3">
        <BookOpen class="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 class="font-semibold text-lg">Courses</h3>
        <p class="text-sm text-muted-foreground">View and manage your enrolled courses</p>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Enrolled</span>
        <span class="text-sm font-medium">{{ coursesCount || 6 }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">In Progress</span>
        <span class="text-sm font-medium">{{ Math.max(coursesCount - 2, 4) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Completed</span>
        <span class="text-sm font-medium">2</span>
      </div>
    </div>
  </div>
  
  <!-- Assignments Card -->
  <div class="rounded-lg border bg-card p-6">
    <div class="flex items-center gap-4 mb-4">
      <div class="rounded-full bg-primary/10 p-3">
        <ClipboardList class="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 class="font-semibold text-lg">Assignments</h3>
        <p class="text-sm text-muted-foreground">Track your upcoming assignments</p>
      </div>
    </div>
    <div class="space-y-2">
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Pending</span>
        <span class="text-sm font-medium">{{ pendingAssignments || 3 }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Submitted</span>
        <span class="text-sm font-medium">12</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Late</span>
        <span class="text-sm font-medium">1</span>
      </div>
    </div>
  </div>
  
  <!-- Grades Card -->
  <div class="rounded-lg border bg-card p-6">
    <div class="flex items-center gap-4 mb-4">
      <div class="rounded-full bg-primary/10 p-3">
        <GraduationCap class="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 class="font-semibold text-lg">Grades</h3>
        <p class="text-sm text-muted-foreground">View your academic performance</p>
      </div>
    </div>
    <div v-if="loadingGrades" class="space-y-2">
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Loading...</span>
        <div class="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
    <div v-else-if="gradesError" class="space-y-2">
      <div class="flex justify-between">
        <span class="text-sm text-red-500">Error loading grades</span>
        <span class="text-sm font-medium">--</span>
      </div>
    </div>
    <div v-else class="space-y-2">
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Average</span>
        <span class="text-sm font-medium">{{ averageGrade || '--' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Top Grade</span>
        <span class="text-sm font-medium">{{ topGrade || '--' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Lowest Grade</span>
        <span class="text-sm font-medium">{{ lowestGrade || '--' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BookOpen, ClipboardList, GraduationCap } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

defineProps({
  coursesCount: {
    type: Number,
    default: 0
  },
  pendingAssignments: {
    type: Number,
    default: 0
  },
  upcomingDeadlines: {
    type: Number,
    default: 0
  }
})

// Grades state
const { userId, isAuthenticated, token } = useAuth()
const grades = ref([])
const loadingGrades = ref(false)
const gradesError = ref(null)

// Computed grade statistics
const averageGrade = computed(() => {
  if (grades.value.length === 0) return null
  const numericGrades = grades.value
    .map(g => parseFloat(g.gradeValue))
    .filter(g => !isNaN(g))
  
  if (numericGrades.length === 0) return null
  
  const sum = numericGrades.reduce((acc, grade) => acc + grade, 0)
  return (sum / numericGrades.length).toFixed(1)
})

const topGrade = computed(() => {
  if (grades.value.length === 0) return null
  const numericGrades = grades.value
    .map(g => parseFloat(g.gradeValue))
    .filter(g => !isNaN(g))
  
  return numericGrades.length > 0 ? Math.max(...numericGrades).toString() : null
})

const lowestGrade = computed(() => {
  if (grades.value.length === 0) return null
  const numericGrades = grades.value
    .map(g => parseFloat(g.gradeValue))
    .filter(g => !isNaN(g))
  
  return numericGrades.length > 0 ? Math.min(...numericGrades).toString() : null
})

// Fetch grades function
async function fetchGrades() {
  if (!isAuthenticated.value || !userId.value) return
  
  loadingGrades.value = true
  gradesError.value = null
  
  try {
    const response = await $fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: {
        query: `
          query GetStudentGrades($studentId: ID!) {
            grades(studentId: $studentId) {
              id
              gradeValue
              gradeType
              courseId
            }
          }
        `,
        variables: {
          studentId: userId.value
        }
      }
    })
    
    grades.value = response.data?.grades || []
  } catch (err) {
    console.error('Error fetching grades for dashboard:', err)
    gradesError.value = err
  } finally {
    loadingGrades.value = false
  }
}

// Fetch grades when component mounts
onMounted(() => {
  if (isAuthenticated.value) {
    fetchGrades()
  }
})
</script> 