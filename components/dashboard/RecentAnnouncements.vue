<template>
  <div class="rounded-lg border bg-card">
    <div class="p-6">
      <h3 class="text-xl font-semibold tracking-tight mb-4">Recent Announcements</h3>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span class="ml-3 text-sm text-muted-foreground">Loading announcements...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-600 mb-2">
          <AlertCircle class="w-8 h-8 mx-auto" />
        </div>
        <p class="text-sm text-muted-foreground">Failed to load announcements</p>
      </div>

      <!-- No Announcements -->
      <div v-else-if="recentAnnouncements.length === 0" class="text-center py-8">
        <div class="text-muted-foreground mb-2">
          <MessageSquare class="w-8 h-8 mx-auto" />
        </div>
        <p class="text-sm text-muted-foreground">No recent announcements</p>
      </div>

      <!-- Announcements List -->
      <div v-else class="space-y-4">
        <div 
          v-for="announcement in recentAnnouncements" 
          :key="announcement.id" 
          class="space-y-2 pb-4 border-b last:border-b-0 last:pb-0"
        >
          <div class="flex items-center justify-between">
            <h4 class="font-medium">{{ announcement.title }}</h4>
            <span class="text-xs text-muted-foreground">
              {{ announcement.createdAt ? formatDate(announcement.createdAt) : 'Recent' }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground line-clamp-2">{{ announcement.content }}</p>
          <div class="flex items-center text-xs text-muted-foreground">
            <MessageSquare class="h-3.5 w-3.5 mr-1" />
            <span>{{ announcement.courseName || 'Course' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { MessageSquare, AlertCircle } from 'lucide-vue-next'
import { useAnnouncements } from '~/composables/useAnnouncements'
import { useAuth } from '~/composables/useAuth'
import type { Course } from '~/composables/useCourses'

// Define props
interface Props {
  filteredCourses: Course[]
}

const props = defineProps<Props>()

// Use the announcements composable
const {
  recentAnnouncements,
  loading,
  error,
  fetchRecentAnnouncementsFromCourses,
  clearAnnouncements
} = useAnnouncements()

// Check authentication
const { isAuthenticated } = useAuth()

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Fetch announcements when filtered courses are available
watch(() => props.filteredCourses, (newCourses) => {
  if (isAuthenticated.value && newCourses && newCourses.length > 0) {
    fetchRecentAnnouncementsFromCourses(newCourses)
  }
}, { immediate: true })

// Clear announcements when user logs out
watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    clearAnnouncements()
  }
})

// Initial fetch on mount if filtered courses are already available
onMounted(() => {
  if (isAuthenticated.value && props.filteredCourses && props.filteredCourses.length > 0) {
    fetchRecentAnnouncementsFromCourses(props.filteredCourses)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style> 