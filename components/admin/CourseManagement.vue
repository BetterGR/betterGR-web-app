<template>
  <div class="space-y-6">
    <!-- Header with Semester Filter -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h2 class="text-2xl font-bold text-foreground">Course Management</h2>
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-muted-foreground">Semester:</label>
          <select
            v-model="selectedSemester"
            class="px-3 py-1 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option v-for="semester in availableSemesters" :key="semester" :value="semester">
              {{ semester }}
            </option>
          </select>
        </div>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add New Course
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
      <p class="text-destructive">{{ error.message }}</p>
      <button
        @click="refreshData()"
        class="mt-2 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90"
      >
        Retry
      </button>
    </div>

    <!-- Courses List -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="mt-2 text-muted-foreground">Loading courses...</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="course in filteredCourses" :key="course.id" class="bg-card border border-border rounded-lg overflow-hidden">
        <!-- Course Header -->
        <div class="p-6 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-foreground">{{ course.name }}</h3>
              <p class="text-muted-foreground">{{ course.semester }}</p>
              <p v-if="course.description" class="text-sm text-muted-foreground mt-1">{{ course.description }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="toggleCourseExpansion(course.id)"
                class="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
              >
                <svg 
                  class="w-4 h-4 transition-transform" 
                  :class="{ 'rotate-180': expandedCourses.includes(course.id) }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                {{ expandedCourses.includes(course.id) ? 'Hide Details' : 'Show Details' }}
              </button>
              <button
                @click="editCourse(course)"
                class="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Edit
              </button>
              <button
                @click="deleteCourseAction(course)"
                class="text-destructive hover:text-destructive/80 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Expandable Course Details -->
        <div v-if="expandedCourses.includes(course.id)" class="p-6 bg-muted/20">
          <!-- Course Stats -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-card p-4 rounded-lg border border-border">
              <h4 class="text-sm font-medium text-muted-foreground">Announcements</h4>
              <p class="text-2xl font-bold text-foreground">{{ getCourseAnnouncementsCount(course.id) }}</p>
            </div>
            <div class="bg-card p-4 rounded-lg border border-border">
              <h4 class="text-sm font-medium text-muted-foreground">Course ID</h4>
              <p class="text-sm font-mono text-foreground">{{ course.id }}</p>
            </div>
          </div>

          <!-- Course Announcements -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-semibold text-foreground">Course Announcements</h4>
              <button
                @click="openAnnouncementModal(course)"
                class="bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80 transition-colors text-sm"
              >
                Add Announcement
              </button>
            </div>

            <div class="space-y-3">
              <div 
                v-for="announcement in getCourseAnnouncements(course.id)" 
                :key="announcement.id"
                class="bg-card p-4 rounded-lg border border-border"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h5 class="font-medium text-foreground">{{ announcement.title }}</h5>
                    <p class="text-sm text-muted-foreground mt-1">{{ announcement.content }}</p>
                    <div class="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                      <span>{{ formatDate(announcement.createdAt) }}</span>
                      <span v-if="announcement.priority" class="bg-destructive/10 text-destructive px-2 py-1 rounded">
                        High Priority
                      </span>
                    </div>
                  </div>
                  <button
                    @click="deleteAnnouncementAction(announcement)"
                    class="text-destructive hover:text-destructive/80 text-sm ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div v-if="getCourseAnnouncements(course.id).length === 0" class="text-center py-4 text-muted-foreground">
                No announcements for this course yet.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredCourses.length === 0" class="text-center py-8 text-muted-foreground">
        {{ selectedSemester ? `No courses found for ${selectedSemester} semester.` : 'No courses found. Add your first course to get started.' }}
      </div>
    </div>

    <!-- Create/Edit Course Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">
            {{ editingCourse ? 'Edit Course' : 'Add New Course' }}
          </h3>
        </div>
        
        <form @submit.prevent="submitCourse" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Course Name</label>
            <input
              v-model="newCourse.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter course name"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Semester</label>
            <input
              v-model="newCourse.semester"
              type="text"
              required
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Spring 2024"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              v-model="newCourse.description"
              rows="3"
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter course description"
            ></textarea>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="cancelForm"
              class="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Add Course') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Announcement Modal -->
    <div v-if="showAnnouncementModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-card border border-border rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">
            Add Announcement to {{ selectedCourse?.name }}
          </h3>
        </div>
        
        <form @submit.prevent="submitAnnouncement" class="p-6 space-y-4">
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
              :disabled="submittingAnnouncement"
              class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
            >
              {{ submittingAnnouncement ? 'Creating...' : 'Create Announcement' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAdminData } from '~/composables/useAdminData'

interface Course {
  id: string
  name: string
  semester: string
  description?: string
}

interface Announcement {
  id: string
  title: string
  content: string
  courseId: string
  priority: boolean
  createdAt: Date
}

// Use shared admin data composable
const {
  loading,
  error,
  courses,
  announcements,
  selectedSemester,
  availableSemesters,
  filteredCourses,
  getCourseAnnouncements,
  getCourseAnnouncementsCount,
  loadAllData,
  loadCoursesForSemester,
  createCourse,
  updateCourse,
  deleteCourse,
  createAnnouncement,
  deleteAnnouncement,
  refreshData
} = useAdminData()

// Local state for UI
const showCreateModal = ref(false)
const editingCourse = ref<Course | null>(null)
const newCourse = ref({
  name: '',
  semester: '',
  description: ''
})
const submitting = ref(false)
const expandedCourses = ref<string[]>([])
const selectedCourse = ref<Course | null>(null)
const announcementForm = ref({
  title: '',
  content: '',
  priority: false
})
const showAnnouncementModal = ref(false)
const submittingAnnouncement = ref(false)

// Methods
const editCourse = (course: Course) => {
  editingCourse.value = { ...course }
  Object.assign(newCourse.value, course)
  showCreateModal.value = true
}

const deleteCourseAction = async (course: Course) => {
  if (confirm(`Are you sure you want to delete ${course.name}?`)) {
    try {
      await deleteCourse(course.id)
    } catch (err) {
      console.error('Error deleting course:', err)
    }
  }
}

const submitCourse = async () => {
  submitting.value = true
  
  try {
    if (editingCourse.value) {
      // Update existing course
      await updateCourse(editingCourse.value.id, {
        name: newCourse.value.name,
        semester: newCourse.value.semester,
        description: newCourse.value.description
      })
    } else {
      // Create new course
      await createCourse({
        name: newCourse.value.name,
        semester: newCourse.value.semester,
        description: newCourse.value.description
      })
    }
    
    // Reset form and close modal
    cancelForm()
  } catch (err) {
    console.error('Error saving course:', err)
  } finally {
    submitting.value = false
  }
}

const cancelForm = () => {
  newCourse.value = {
    name: '',
    semester: '',
    description: ''
  }
  editingCourse.value = null
  showCreateModal.value = false
}

const toggleCourseExpansion = (courseId: string) => {
  if (expandedCourses.value.includes(courseId)) {
    expandedCourses.value = expandedCourses.value.filter(id => id !== courseId)
  } else {
    expandedCourses.value.push(courseId)
  }
}

const openAnnouncementModal = (course: Course) => {
  selectedCourse.value = course
  announcementForm.value = {
    title: '',
    content: '',
    priority: false
  }
  showAnnouncementModal.value = true
}

const submitAnnouncement = async () => {
  if (!selectedCourse.value) return

  submittingAnnouncement.value = true
  
  try {
    await createAnnouncement({
      courseId: selectedCourse.value.id,
      title: announcementForm.value.title,
      content: announcementForm.value.content,
      priority: announcementForm.value.priority
    })
    
    cancelAnnouncementForm()
  } catch (err) {
    console.error('Error creating announcement:', err)
  } finally {
    submittingAnnouncement.value = false
  }
}

const deleteAnnouncementAction = async (announcement: Announcement) => {
  if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
    try {
      await deleteAnnouncement(announcement.courseId, announcement.id)
    } catch (err) {
      console.error('Error deleting announcement:', err)
    }
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

// Watch for semester changes and reload courses
watch(selectedSemester, async (newSemester) => {
  if (newSemester) {
    await loadCoursesForSemester(newSemester)
  }
})

// Load initial data
onMounted(() => {
  loadAllData()
})
</script> 