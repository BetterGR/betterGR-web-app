import { ref, computed, Ref } from 'vue'
import { useCourses, type Course } from './useCourses.js'

/**
 * Assignment data model
 */
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  course: string;
  courseId: string;
  dueDate: string;
  status: string;
  semesterId: string;
  [key: string]: any;
}

/**
 * Composable for managing assignment data
 */
export function useAssignments(currentSemesterId: Ref<string>) {
  const { courses } = useCourses()
  
  // State
  const assignments: Ref<Assignment[]> = ref([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Extract assignments from courses
   */
  function extractAssignmentsFromCourses() {
    const extractedAssignments: Assignment[] = []
    
    courses.value.forEach(course => {
      const courseAssignments = (course.homework || []).map(hw => ({
        id: hw.id,
        title: hw.title,
        description: hw.description || '',
        course: course.name,
        courseId: course.id,
        dueDate: hw.dueDate,
        // Default to 'pending' status - this could be calculated based on due date
        status: new Date(hw.dueDate) < new Date() ? 'overdue' : 'pending',
        semesterId: course.semesterId
      }))
      
      extractedAssignments.push(...courseAssignments)
    })
    
    assignments.value = extractedAssignments
  }

  /**
   * Filter assignments by current semester
   */
  const filteredAssignments = computed(() => {
    return assignments.value.filter(assignment => 
      assignment.semesterId === currentSemesterId.value && 
      (assignment.status === 'pending' || assignment.status === 'overdue')
    )
  })

  /**
   * Get upcoming assignments sorted by due date
   */
  const upcomingAssignments = computed(() => {
    return filteredAssignments.value
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  })

  /**
   * Count of pending assignments
   */
  const pending = computed(() => 
    assignments.value.filter(a => 
      a.semesterId === currentSemesterId.value && 
      a.status === 'pending'
    ).length
  )

  /**
   * Count of assignments due within the next week
   */
  const upcoming = computed(() => {
    const now = new Date()
    const oneWeekLater = new Date()
    oneWeekLater.setDate(now.getDate() + 7)
    
    return assignments.value.filter(a => {
      const dueDate = new Date(a.dueDate)
      return a.semesterId === currentSemesterId.value && 
            a.status === 'pending' && 
            dueDate >= now && 
            dueDate <= oneWeekLater
    }).length
  })

  // Update assignments whenever courses change
  function updateAssignments() {
    extractAssignmentsFromCourses()
  }

  return {
    assignments,
    loading,
    error,
    filteredAssignments,
    upcomingAssignments,
    pending,
    upcoming,
    updateAssignments
  }
} 