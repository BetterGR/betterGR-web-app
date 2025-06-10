<template>
  <div class="min-h-screen bg-background">
    <!-- Admin Navigation -->
    <div class="bg-card border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-foreground">BetterGR Admin</h1>
            <div class="flex space-x-1">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                ]"
              >
                {{ tab.name }}
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-muted-foreground">Welcome, {{ userName }}</span>
            <button
              @click="goToStudentView"
              class="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Student View
            </button>
            <button
              @click="logout"
              class="bg-destructive text-destructive-foreground px-3 py-1 rounded-md hover:bg-destructive/90 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Course Management Tab -->
      <AdminCourseManagement v-if="activeTab === 'courses'" />
      
      <!-- Announcement Management Tab -->
      <AdminAnnouncementManagement v-if="activeTab === 'announcements'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const { logout: authLogout, userName } = useAuth()
const router = useRouter()

const activeTab = ref('courses')

const tabs = [
  { id: 'courses', name: 'Courses' },
  { id: 'announcements', name: 'Announcements' }
]

const logout = async () => {
  await authLogout()
  router.push('/')
}

const goToStudentView = () => {
  router.push('/')
}
</script> 