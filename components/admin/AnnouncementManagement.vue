<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-foreground">Announcement Management</h2>
      <button
        @click="showCreateModal = true"
        class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Announcement
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

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="mt-2 text-muted-foreground">Loading announcements...</p>
    </div>

    <!-- Announcements List -->
    <div v-else class="space-y-4">
      <div
        v-for="announcement in announcements"
        :key="announcement.id"
        class="bg-card border border-border rounded-lg p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-foreground">{{ announcement.title }}</h3>
            <p class="text-muted-foreground mt-1">{{ announcement.content }}</p>
            <div class="flex items-center space-x-4 text-sm text-muted-foreground mt-3">
              <span>Course: {{ getCourseName(announcement.courseId) }}</span>
              <span>{{ formatDate(announcement.createdAt) }}</span>
              <span v-if="announcement.priority" class="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs">
                High Priority
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="deleteAnnouncementAction(announcement)"
              class="text-destructive hover:text-destructive/80 font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="announcements.length === 0" class="text-center py-8 text-muted-foreground">
        No announcements found. Create your first announcement to get started.
      </div>
    </div>

    <!-- Create Announcement Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg p-6 w-full max-w-lg mx-4 border border-border">
        <h3 class="text-lg font-semibold mb-4 text-foreground">
          Create New Announcement
        </h3>
        
        <form @submit.prevent="submitAnnouncement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Title</label>
            <input
              v-model="announcementForm.title"
              type="text"
              required
              class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Announcement title..."
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Content</label>
            <textarea
              v-model="announcementForm.content"
              rows="4"
              required
              class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Announcement content..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Course</label>
            <select
              v-model="announcementForm.courseId"
              required
              class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a course</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.name }} ({{ course.semester }})</option>
            </select>
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
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="cancelAnnouncementForm"
              class="px-4 py-2 text-foreground border border-input rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {{ submitting ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAdminData } from '~/composables/useAdminData'

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
  getCourseName,
  loadAllData,
  refreshData,
  createAnnouncement,
  deleteAnnouncement
} = useAdminData()

// Local state
const submitting = ref(false)

// Modal state
const showCreateModal = ref(false)

// Form data
const announcementForm = reactive({
  title: '',
  content: '',
  courseId: '',
  priority: false
})

// Methods
const deleteAnnouncementAction = async (announcement: Announcement) => {
  if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
    try {
      await deleteAnnouncement(announcement.courseId, announcement.id)
    } catch (err) {
      console.error('Error deleting announcement:', err)
    }
  }
}

const submitAnnouncement = async () => {
  submitting.value = true
  
  try {
    await createAnnouncement({
      courseId: announcementForm.courseId,
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority
    })
    
    cancelAnnouncementForm()
  } catch (err) {
    console.error('Error saving announcement:', err)
  } finally {
    submitting.value = false
  }
}

const cancelAnnouncementForm = () => {
  Object.assign(announcementForm, {
    title: '',
    content: '',
    courseId: '',
    priority: false
  })
  showCreateModal.value = false
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Load data on component mount
onMounted(() => {
  loadAllData()
})
</script> 