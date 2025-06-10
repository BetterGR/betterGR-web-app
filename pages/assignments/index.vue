<template>
  <div class="py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight mb-2">Assignments</h1>
        <p class="text-muted-foreground">
          Track and manage all your coursework
        </p>
      </div>
      <div class="flex items-center gap-2">
        <select 
          v-model="statusFilter" 
          class="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <select 
          v-model="courseFilter" 
          class="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Courses</option>
          <option value="234124">Yearly Project</option>
          <option value="236781">Deep Learning</option>
        </select>
      </div>
    </div>

    <div class="rounded-lg border bg-card mb-6">
      <div class="p-4 font-medium border-b grid grid-cols-12 items-center">
        <div class="col-span-5">Assignment</div>
        <div class="col-span-2">Course</div>
        <div class="col-span-2">Due Date</div>
        <div class="col-span-2">Status</div>
        <div class="col-span-1">Actions</div>
      </div>
      <div v-for="assignment in filteredAssignments" :key="assignment.id" class="p-4 border-b last:border-b-0 grid grid-cols-12 items-center">
        <div class="col-span-5">
          <div class="font-medium">{{ assignment.title }}</div>
          <div class="text-sm text-muted-foreground">{{ assignment.description }}</div>
        </div>
        <div class="col-span-2 text-sm">{{ assignment.course }}</div>
        <div class="col-span-2 text-sm">{{ assignment.dueDate }}</div>
        <div class="col-span-2">
          <span 
            :class="{
              'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400': assignment.status === 'completed',
              'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400': assignment.status === 'pending',
              'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400': assignment.status === 'overdue',
            }"
            class="inline-block rounded-full px-2 py-1 text-xs font-semibold"
          >
            {{ assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1) }}
          </span>
        </div>
        <div class="col-span-1 flex justify-center">
          <button 
            v-if="assignment.status !== 'completed'" 
            @click="markCompleted(assignment.id)"
            class="text-xs rounded bg-primary/10 hover:bg-primary/20 text-primary p-1"
          >
            Mark Complete
          </button>
          <button 
            v-else
            @click="markIncomplete(assignment.id)"
            class="text-xs rounded bg-muted hover:bg-muted/80 p-1"
          >
            Mark Incomplete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { assignments as assignmentsData } from '@/data/assignments'

// Local filters for this page
const statusFilter = ref('all')
const courseFilter = ref('all')

// Make assignments reactive
const assignments = ref(assignmentsData)

// Filtered assignments based on selected filters
const filteredAssignments = computed(() => {
  return assignments.value
    .filter(assignment => {
      const statusMatch = statusFilter.value === 'all' || assignment.status === statusFilter.value
      const courseMatch = courseFilter.value === 'all' || assignment.courseId === courseFilter.value
      return statusMatch && courseMatch
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
})

// These functions will call the API in the future
const markCompleted = (id) => {
  const assignment = assignments.value.find(a => a.id === id)
  if (assignment) {
    assignment.status = 'completed'
  }
}

const markIncomplete = (id) => {
  const assignment = assignments.value.find(a => a.id === id)
  if (assignment) {
    assignment.status = 'pending'
  }
}
</script> 