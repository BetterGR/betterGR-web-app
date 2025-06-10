import { ref, Ref } from 'vue'
import { useAuth } from './useAuth.js'

/**
 * Course data model
 */
export interface Course {
  id: string;
  name: string;
  title: string;
  code: string;
  semester: string;
  semesterId: string;
  slug: string;
  description?: string;
}

/**
 * Convert course name to URL-friendly slug
 * This should match the naming convention used in content/courses/ directory
 */
function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Create semester ID from semester name
 */
function createSemesterIdFromName(semester: string): string {
  return semester
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
}

/**
 * Course data composable
 */
export function useCourses() {
  const { userId, isAuthenticated } = useAuth()
  
  // State
  const courses: Ref<Course[]> = ref([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  /**
   * Fetch courses for the current user
   */
  async function fetchCourses() {
    if (!isAuthenticated.value || !userId.value) {
      error.value = new Error('User not authenticated')
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      // Get courses using direct GraphQL query (like dashboard does)
      const { token } = useAuth()
      const response = await $fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        body: {
          query: `
            query GetStudentCourses($studentId: ID!) {
              studentCourses(studentId: $studentId) {
                id
                name
                semester
                description
              }
            }
          `,
          variables: {
            studentId: userId.value
          }
        }
      })
      
      const data = response.data?.studentCourses || []
      
      // Process the data to match our Course interface
      // Map GraphQL response fields to expected UI fields
      courses.value = data.map((course: any) => {
        const courseName = course.name || 'Untitled Course'
        const semesterName = course.semester || 'Unknown Semester'
        
        return {
          id: course.id || '',
          name: courseName,
          title: courseName, // Map name to title for UI compatibility
          semester: semesterName,
          semesterId: createSemesterIdFromName(semesterName), // Create proper semester ID
          description: course.description || '',
          code: course.id || '', // Use just the course ID as the code
          slug: createSlugFromName(courseName) // Create URL-friendly slug from course name
        }
      })
      
    } catch (err) {
      console.error('Error fetching courses:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      courses.value = [] // Clear courses on error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Find a course by ID
   */
  function findCourseById(id: string): Course | undefined {
    return courses.value.find(course => course.id === id)
  }
  
  return {
    courses,
    loading,
    error,
    fetchCourses,
    findCourseById,
    isAuthenticated
  }
} 