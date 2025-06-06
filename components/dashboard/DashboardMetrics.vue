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
    <div class="space-y-2">
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Average GPA</span>
        <span class="text-sm font-medium">91.2</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Top Grade</span>
        <span class="text-sm font-medium">98</span>
      </div>
      <div class="flex justify-between">
        <span class="text-sm text-muted-foreground">Lowest Grade</span>
        <span class="text-sm font-medium">82</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, ClipboardList, GraduationCap } from 'lucide-vue-next'

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
</script> 