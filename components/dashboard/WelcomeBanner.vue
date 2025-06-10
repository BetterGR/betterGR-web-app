<template>
  <div class="mb-8 rounded-lg border bg-card p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight mb-1">
          Welcome back, {{ studentDisplayName }}
        </h1>
        <p class="text-muted-foreground">
          Current semester: {{ semesterName }}
        </p>
      </div>
      <div class="hidden md:block">
        <div class="text-primary h-16 w-16 flex items-center justify-center text-2xl font-bold">
          {{ studentInitial }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStudent } from '~/composables/useStudent'
import { onMounted, computed } from 'vue'

interface Props {
  semesterName: string
}

const props = defineProps<Props>()

// Get student data
const { student, loading, error, fetchStudent, getDisplayName, getFirstName } = useStudent()

// Computed property for student display name using the improved fallback logic
const studentDisplayName = computed(() => {
  if (loading.value) return 'Loading...'
  
  // Use the getDisplayName function which handles fallbacks
  return getDisplayName()
})

// Computed property for student initial
const studentInitial = computed(() => {
  const firstName = getFirstName()
  return firstName.charAt(0).toUpperCase() || 'S'
})

// Fetch student data when component mounts
onMounted(async () => {
  try {
    await fetchStudent()
  } catch (err) {
    // Silently handle errors since we have fallback mechanism
  }
})
</script>