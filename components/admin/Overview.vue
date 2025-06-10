<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-foreground">System Overview</h2>
      <div class="flex space-x-2">
        <button
          @click="refreshData"
          :disabled="loading"
          class="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Refreshing...' : 'Refresh Data' }}
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive">{{ error.message }}</p>
      <button
        @click="refreshData"
        class="mt-2 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90"
      >
        Retry
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="mt-2 text-muted-foreground">Loading system data...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-card p-6 rounded-lg border border-border">
          <h3 class="text-sm font-medium text-muted-foreground">Total Courses</h3>
          <p class="text-2xl font-bold text-foreground">{{ courses.length }}</p>
          <p class="text-xs text-muted-foreground mt-1">Active courses in system</p>
        </div>
        <div class="bg-card p-6 rounded-lg border border-border">
          <h3 class="text-sm font-medium text-muted-foreground">Total Students</h3>
          <p class="text-2xl font-bold text-foreground">{{ students.length }}</p>
          <p class="text-xs text-muted-foreground mt-1">Registered students</p>
        </div>
        <div class="bg-card p-6 rounded-lg border border-border">
          <h3 class="text-sm font-medium text-muted-foreground">Total Enrollments</h3>
          <p class="text-2xl font-bold text-foreground">{{ totalEnrollments }}</p>
          <p class="text-xs text-muted-foreground mt-1">Student-course enrollments</p>
        </div>
        <div class="bg-card p-6 rounded-lg border border-border">
          <h3 class="text-sm font-medium text-muted-foreground">Recent Announcements</h3>
          <p class="text-2xl font-bold text-foreground">{{ recentAnnouncementsCount }}</p>
          <p class="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-card p-6 rounded-lg border border-border">
        <h3 class="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            @click="$emit('navigate', 'courses')"
            class="flex items-center justify-center space-x-2 bg-primary text-primary-foreground p-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Course</span>
          </button>
          <button
            @click="$emit('navigate', 'students')"
            class="flex items-center justify-center space-x-2 bg-secondary text-secondary-foreground p-3 rounded-md hover:bg-secondary/80 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Add Student</span>
          </button>
          <button
            @click="$emit('navigate', 'announcements')"
            class="flex items-center justify-center space-x-2 bg-accent text-accent-foreground p-3 rounded-md hover:bg-accent/80 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>Create Announcement</span>
          </button>
          <button
            @click="$emit('navigate', 'enrollments')"
            class="flex items-center justify-center space-x-2 bg-muted text-muted-foreground p-3 rounded-md hover:bg-muted/80 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Manage Enrollments</span>
          </button>
        </div>
      </div>

      <!-- Courses Overview -->
      <div class="bg-card p-6 rounded-lg border border-border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-foreground">All Courses</h3>
          <button
            @click="$emit('navigate', 'courses')"
            class="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Manage Courses →
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="course in courses"
            :key="course.id"
            class="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
          >
            <h4 class="font-medium text-foreground">{{ course.name }}</h4>
            <p class="text-sm text-muted-foreground">{{ course.semester }}</p>
            <p v-if="course.description" class="text-xs text-muted-foreground mt-1 line-clamp-2">{{ course.description }}</p>
            
            <div class="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{{ getEnrolledStudentsCount(course.id) }} students</span>
              <span>{{ getCourseAnnouncementsCount(course.id) }} announcements</span>
            </div>
            
            <button
              @click="showCourseAnnouncements(course)"
              class="mt-2 w-full bg-secondary text-secondary-foreground py-2 px-3 rounded text-xs hover:bg-secondary/80 transition-colors"
            >
              Add Announcement
            </button>
          </div>
        </div>

        <div v-if="courses.length === 0" class="text-center py-8 text-muted-foreground">
          No courses found. Add your first course to get started.
        </div>
      </div>

      <!-- Students Overview -->
      <div class="bg-card p-6 rounded-lg border border-border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-foreground">All Students</h3>
          <button
            @click="$emit('navigate', 'students')"
            class="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Manage Students →
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="student in students"
            :key="student.id"
            class="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
          >
            <h4 class="font-medium text-foreground">{{ student.firstName }} {{ student.lastName }}</h4>
            <p class="text-sm text-muted-foreground">{{ student.email }}</p>
            <p v-if="student.phoneNumber" class="text-xs text-muted-foreground">{{ student.phoneNumber }}</p>
            
            <div class="mt-3 text-xs text-muted-foreground">
              <span>Enrolled in {{ getStudentEnrollmentsCount(student.id) }} courses</span>
            </div>
          </div>
        </div>

        <div v-if="students.length === 0" class="text-center py-8 text-muted-foreground">
          No students found. Add your first student to get started.
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-card p-6 rounded-lg border border-border">
        <h3 class="text-lg font-semibold text-foreground mb-4">Recent Announcements</h3>
        
        <div class="space-y-3">
          <div
            v-for="announcement in recentAnnouncements"
            :key="announcement.id"
            class="border border-border rounded-lg p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-foreground">{{ announcement.title }}</h4>
                <p class="text-sm text-muted-foreground mt-1">{{ announcement.content }}</p>
                <div class="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <span>{{ getCourseName(announcement.courseId) }}</span>
                  <span>•</span>
                  <span>{{ formatDate(announcement.createdAt) }}</span>
                  <span v-if="announcement.priority" class="bg-destructive/10 text-destructive px-2 py-1 rounded">
                    High Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="recentAnnouncements.length === 0" class="text-center py-8 text-muted-foreground">
          No recent announcements found.
        </div>
      </div>
    </div>

    <!-- Quick Announcement Modal -->
    <div v-if="showAnnouncementModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-card border border-border rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">
            Add Announcement to {{ selectedCourse?.name }}
          </h3>
        </div>
        
        <form @submit.prevent="createAnnouncement" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              v-model="announcementForm.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Announcement title"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Content</label>
            <textarea
              v-model="announcementForm.content"
              rows="4"
              required
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Announcement content"
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-2">
            <input
              v-model="announcementForm.priority"
              type="checkbox"
              id="priority"
              class="rounded border-input text-primary focus:ring-ring"
            />
            <label for="priority" class="text-sm font-medium text-foreground">
              High Priority
            </label>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="cancelAnnouncementForm"
              class="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Creating...' : 'Create Announcement' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'
import { useAuth } from '~/composables/useAuth'

interface Course {
  id: string
  name: string
  semester: string
  description?: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
}

interface Announcement {
  id: string
  title: string
  content: string
  courseId: string
  priority: boolean
  createdAt: Date
}

// Composables
const graphql = useGraphQL()
const { isAuthenticated } = useAuth()

// State
const loading = ref(false)
const error = ref<Error | null>(null)
const courses = ref<Course[]>([])
const students = ref<Student[]>([])
const announcements = ref<Announcement[]>([])
const enrollments = ref<{ courseId: string; students: Student[] }[]>([])
const showAnnouncementModal = ref(false)
const selectedCourse = ref<Course | null>(null)
const submitting = ref(false)
const announcementForm = ref({
  title: '',
  content: '',
  priority: false
})

// Computed properties
const totalEnrollments = computed(() => {
  return enrollments.value.reduce((total, enrollment) => total + enrollment.students.length, 0)
})

const recentAnnouncements = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  return announcements.value
    .filter(a => a.createdAt >= sevenDaysAgo)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
})

const recentAnnouncementsCount = computed(() => recentAnnouncements.value.length)

// Methods
const refreshData = async () => {
  await loadAllData()
}

const loadAllData = async () => {
  if (!isAuthenticated.value) {
    return
  }

  loading.value = true
  error.value = null
  
  try {
    // Load all data in parallel
    const [coursesData, studentsData] = await Promise.all([
      graphql.getAllCourses(),
      graphql.getAllStudents()
    ])
    
    courses.value = coursesData
    students.value = studentsData
    
    // Load enrollments and announcements for all courses
    await Promise.all([
      loadAllEnrollments(),
      loadAllAnnouncements()
    ])
  } catch (err) {
    error.value = err as Error
    console.error('Error loading system data:', err)
    
    // Fallback data
    courses.value = [
      { id: '1', name: 'Yearly Project', semester: 'Spring 2024', description: 'A comprehensive year-long project course' },
      { id: '2', name: 'Deep Learning', semester: 'Winter 2025', description: 'Advanced course on deep learning and neural networks' },
      { id: '3', name: 'Software Engineering', semester: 'Fall 2024', description: 'Software development methodologies and practices' }
    ]
    
    students.value = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@technion.ac.il', phoneNumber: '+972-50-123-4567' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@technion.ac.il', phoneNumber: '+972-52-987-6543' },
      { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@technion.ac.il' }
    ]
  } finally {
    loading.value = false
  }
}

const loadAllEnrollments = async () => {
  try {
    const allEnrollments: { courseId: string; students: Student[] }[] = []
    
    for (const course of courses.value) {
      try {
        const courseStudents = await graphql.getCourseStudents(course.id)
        allEnrollments.push({
          courseId: course.id,
          students: courseStudents
        })
      } catch (err) {
        console.warn(`Failed to load students for course ${course.name}:`, err)
        allEnrollments.push({
          courseId: course.id,
          students: []
        })
      }
    }
    
    enrollments.value = allEnrollments
  } catch (err) {
    console.error('Error loading enrollments:', err)
  }
}

const loadAllAnnouncements = async () => {
  try {
    const allAnnouncements: Announcement[] = []
    
    for (const course of courses.value) {
      try {
        const courseAnnouncements = await graphql.GetAnnouncementsByCourse(course.id)
        const formattedAnnouncements = courseAnnouncements.map((announcement: any) => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          courseId: course.id,
          priority: false,
          createdAt: new Date(announcement.createdAt || Date.now())
        }))
        allAnnouncements.push(...formattedAnnouncements)
      } catch (err) {
        console.warn(`Failed to load announcements for course ${course.name}:`, err)
      }
    }
    
    announcements.value = allAnnouncements
  } catch (err) {
    console.error('Error loading announcements:', err)
  }
}

const getEnrolledStudentsCount = (courseId: string): number => {
  const enrollment = enrollments.value.find(e => e.courseId === courseId)
  return enrollment ? enrollment.students.length : 0
}

const getCourseAnnouncementsCount = (courseId: string): number => {
  return announcements.value.filter(a => a.courseId === courseId).length
}

const getStudentEnrollmentsCount = (studentId: string): number => {
  return enrollments.value.filter(e => 
    e.students.some(s => s.id === studentId)
  ).length
}

const getCourseName = (courseId: string): string => {
  const course = courses.value.find(c => c.id === courseId)
  return course ? course.name : 'Unknown Course'
}

const showCourseAnnouncements = (course: Course) => {
  selectedCourse.value = course
  announcementForm.value = {
    title: '',
    content: '',
    priority: false
  }
  showAnnouncementModal.value = true
}

const createAnnouncement = async () => {
  if (!isAuthenticated.value || !selectedCourse.value) {
    error.value = new Error('You must be authenticated and have a course selected')
    return
  }

  submitting.value = true
  
  try {
    const created = await graphql.createAnnouncement({
      courseId: selectedCourse.value.id,
      title: announcementForm.value.title,
      content: announcementForm.value.content
    })
    
    const newAnnouncement: Announcement = {
      id: created.id,
      title: created.title,
      content: announcementForm.value.content,
      courseId: selectedCourse.value.id,
      priority: announcementForm.value.priority,
      createdAt: new Date()
    }
    
    announcements.value.unshift(newAnnouncement)
    cancelAnnouncementForm()
  } catch (err) {
    error.value = err as Error
    console.error('Error creating announcement:', err)
  } finally {
    submitting.value = false
  }
}

const cancelAnnouncementForm = () => {
  selectedCourse.value = null
  announcementForm.value = {
    title: '',
    content: '',
    priority: false
  }
  showAnnouncementModal.value = false
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Lifecycle
onMounted(() => {
  loadAllData()
})

// Emits
defineEmits(['navigate'])
</script> 