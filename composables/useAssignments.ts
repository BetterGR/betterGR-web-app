import { ref, computed, Ref, onMounted, watch } from 'vue'
import { useCourses, type Course } from './useCourses.js'
// @ts-ignore - Import hardcoded assignments as fallback
import { assignments as hardcodedAssignments } from '@/data/assignments'

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
export function useAssignments(currentSemesterId?: Ref<string>) {
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
      // @ts-ignore - Course may have homework property from GraphQL
      const courseAssignments = (course.homework || []).map((hw: any) => ({
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
   * Use hardcoded assignments as fallback when homework microservice is down
   */
  function useFallbackAssignments() {
    // Convert hardcoded assignments to Assignment interface format
    // @ts-ignore - Hardcoded assignments have compatible structure
    assignments.value = hardcodedAssignments.map((assignment: any) => ({
      id: assignment.id.toString(),
      title: assignment.title,
      description: assignment.description || '',
      course: assignment.course,
      courseId: assignment.courseId,
      dueDate: assignment.dueDate,
      status: assignment.status,
      semesterId: assignment.semesterId
    }))
  }

  /**
   * Filter assignments by current semester (if semester is provided)
   */
  const filteredAssignments = computed(() => {
    if (!currentSemesterId || currentSemesterId.value === 'all') {
      return assignments.value.filter(assignment => 
        assignment.status === 'pending' || assignment.status === 'overdue'
      )
    }
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
  const pending = computed(() => {
    if (!currentSemesterId || currentSemesterId.value === 'all') {
      return assignments.value.filter(a => a.status === 'pending').length
    }
    return assignments.value.filter(a => 
      a.semesterId === currentSemesterId.value && 
      a.status === 'pending'
    ).length
  })

  /**
   * Count of assignments due within the next week
   */
  const upcoming = computed(() => {
    const now = new Date()
    const oneWeekLater = new Date()
    oneWeekLater.setDate(now.getDate() + 7)
    
    if (!currentSemesterId || currentSemesterId.value === 'all') {
      return assignments.value.filter(a => {
        const dueDate = new Date(a.dueDate)
        return a.status === 'pending' && 
              dueDate >= now && 
              dueDate <= oneWeekLater
      }).length
    }
    
    return assignments.value.filter(a => {
      const dueDate = new Date(a.dueDate)
      return a.semesterId === currentSemesterId.value && 
            a.status === 'pending' && 
            dueDate >= now && 
            dueDate <= oneWeekLater
    }).length
  })

  /**
   * Update assignments - try from courses first, fallback to hardcoded data
   */
  function updateAssignments() {
    // First try to extract from courses
    extractAssignmentsFromCourses()
    
    // If no assignments were extracted (homework microservice is down), use fallback
    if (assignments.value.length === 0) {
      useFallbackAssignments()
    }
  }

  // Initialize with fallback data immediately
  useFallbackAssignments()

  // Watch for course changes and update assignments
  watch(courses, () => {
    updateAssignments()
  }, { immediate: true })

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