import { ref, Ref } from 'vue'
import { useAuth } from './useAuth.js'
import { useGraphQL } from './useGraphQL.js'

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
 */
function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '_') // Replace hyphens with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single underscore
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
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
  const { getCourses, loading: graphqlLoading } = useGraphQL()
  
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
      // Get courses from the GraphQL API
      const data = await getCourses(userId.value)
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response from server')
      }
      
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