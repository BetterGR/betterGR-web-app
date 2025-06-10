import { ref, Ref, computed, watch } from 'vue'
import { useCourses } from './useCourses.js'

/**
 * Semester data model
 */
export interface Semester {
  id: string;
  name: string;
  [key: string]: any;
}

/**
 * Composable for managing semester data
 */
export function useSemesters() {
  const { courses } = useCourses()
  
  // State
  const semesters: Ref<Semester[]> = ref([])
  const currentSemester = ref<Semester>({
    id: 'all',
    name: 'All Semesters'
  })

  /**
   * Extract unique semesters from courses
   */
  const extractSemesters = computed(() => {
    const semesterMap = new Map<string, Semester>()
    
    // Always include "All Semesters" option
    semesterMap.set('all', {
      id: 'all',
      name: 'All Semesters'
    })
    
    // Extract semesters from courses
    courses.value.forEach(course => {
      if (course.semester && course.semesterId) {
        semesterMap.set(course.semesterId, {
          id: course.semesterId,
          name: course.semester
        })
      }
    })
    
    return Array.from(semesterMap.values())
  })

  /**
   * Set the current semester
   */
  function setCurrentSemester(semesterId: string) {
    const semester = semesters.value.find(s => s.id === semesterId)
    if (semester) {
      currentSemester.value = semester
    }
  }

  /**
   * Filter function to match the old API
   */
  const filterBySemester = <T extends { semesterId: string }>(items: T[]): T[] => {
    // If "All Semesters" is selected, return all items
    if (currentSemester.value.id === 'all') {
      return items
    }
    // Otherwise filter by the selected semester
    return items.filter(item => item.semesterId === currentSemester.value.id)
  }

  // Update semesters when computed value changes
  function updateSemesters() {
    const newSemesters = extractSemesters.value
    semesters.value = newSemesters
    
    // Auto-select the first actual semester (not "All Semesters") if available
    // and current semester is still "All Semesters"
    if (currentSemester.value.id === 'all' && newSemesters.length > 1) {
      const firstActualSemester = newSemesters.find(s => s.id !== 'all')
      if (firstActualSemester) {
        currentSemester.value = firstActualSemester
      }
    }
  }

  return {
    semesters,
    currentSemester,
    setCurrentSemester,
    filterBySemester,
    updateSemesters
  }
} 