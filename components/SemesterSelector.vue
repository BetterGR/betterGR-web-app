<template>
  <div class="semester-selector relative">
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <Calendar class="h-4 w-4" />
      <span>{{ currentSemester.name }}</span>
      <ChevronDown class="h-3 w-3 opacity-50" :class="{ 'transform rotate-180': isOpen }" />
    </button>
    
    <div 
      v-if="isOpen" 
      class="absolute z-50 mt-1 w-48 rounded-md border bg-background shadow-md right-0"
    >
      <ul 
        class="py-1 max-h-60 overflow-auto"
        role="listbox"
      >
        <li 
          v-for="semester in semesters" 
          :key="semester.id"
          class="px-3 py-1.5 text-sm cursor-pointer hover:bg-muted transition-colors"
          :class="{ 'text-primary font-medium': selectedSemesterId === semester.id }"
          role="option"
          :aria-selected="selectedSemesterId === semester.id"
          @click="selectSemester(semester.id)"
        >
          {{ semester.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useSemesters } from '~/composables/useSemesters'
import { Calendar, ChevronDown } from 'lucide-vue-next'

const { semesters, selectedSemesterId, currentSemester, setSemester } = useSemesters()

const isOpen = ref(false)

const selectSemester = (id) => {
  setSemester(id)
  isOpen.value = false
}

// Close dropdown when clicking outside
const clickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.semester-selector')) {
    isOpen.value = false
  }
}

// Setup event listeners
onMounted(() => {
  document.addEventListener('click', clickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', clickOutside)
})
</script> 