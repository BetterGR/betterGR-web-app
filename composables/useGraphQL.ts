import { ref } from 'vue'
import { useAuth } from './useAuth.js'

/**
 * GraphQL client using auto-generated functions with automatic Keycloak authentication
 */
export function useGraphQL() {
  const { isAuthenticated, updateToken, token } = useAuth()
  
  // State
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  /**
   * Refresh the auth token if needed
   */
  async function refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const refreshed = await updateToken(60)
      return !!refreshed
    } catch (error) {
      console.warn('Token refresh failed:', error)
      return false
    }
  }

  /**
   * Sync the GraphQL client token with the current Keycloak token
   */
  function syncGraphQLToken() {
    const currentToken = token.value
    
    if (currentToken) {
      // Update the GraphQL client token with current Keycloak token
      // @ts-ignore - Global composable available after nuxt-graphql-client initialization
      useGqlToken(currentToken)
    } else {
      // @ts-ignore - Global composable available after nuxt-graphql-client initialization
      useGqlToken(null) // Clear the GraphQL token
    }
  }
  
  /**
   * Wrapper function that handles authentication, loading states, and error handling
   * for all GraphQL operations
   */
  async function withAuth<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackValue?: T
  ): Promise<T> {
    try {
      if (!isAuthenticated.value) {
        if (fallbackValue !== undefined) {
          return fallbackValue
        }
        throw new Error('User not authenticated')
      }
      
      loading.value = true
      error.value = null
      
      // Refresh token before making the request
      await refreshTokenIfNeeded()
      
      // CRITICAL: Always sync the GraphQL token with Keycloak before making requests
      syncGraphQLToken()
      
      // Execute the GraphQL operation
      return await operation()
    } catch (err) {
      // Enhanced error handling for authentication errors
      console.error(`Error in ${operationName}:`, err)
      
      // Better error logging for GraphQL errors
      if (err && typeof err === 'object') {
        if ('gqlErrors' in err) {
          const gqlErrors = (err as any).gqlErrors
          if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
            const firstError = gqlErrors[0]
            
            // Check for authentication errors
            if (firstError.message && firstError.message.includes('Unauthenticated')) {
              // Try to refresh token one more time
              try {
                const refreshed = await updateToken(0) // Force refresh
                
                if (refreshed) {
                  // Sync the GraphQL token with the newly refreshed Keycloak token
                  syncGraphQLToken()
                  // Add a delay to ensure the GraphQL client has the updated token
                  await new Promise(resolve => setTimeout(resolve, 500))
                  // Retry the operation once with refreshed token
                  return await operation()
                } else {
                  // Force a new sync even if refresh returned false
                  syncGraphQLToken()
                  await new Promise(resolve => setTimeout(resolve, 500))
                  return await operation()
                }
              } catch (refreshError) {
                console.error('Token refresh failed during retry:', refreshError)
              }
            }
          }
        }
      }
      
      const errorMessage = err instanceof Error ? err.message : String(err)
      error.value = new Error(`Error in ${operationName}: ${errorMessage}`)
      
      if (fallbackValue !== undefined) {
        return fallbackValue
      }
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch student courses
   */
  async function getCourses(studentId: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlGetStudentCourses({ studentId })
      return data.studentCourses || []
    }, 'getCourses', [])
  }

  /**
   * Fetch grades
   */
  async function getGrades(studentId: string, courseId?: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlGetGrades({ studentId, courseId })
      return data.grades || []
    }, 'getGrades', [])
  }

  /**
   * Create a new course
   */
  async function createCourse(input: any) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlCreateCourse({ input })
      return data.createCourse
    }, 'createCourse')
  }

  /**
   * Update course
   */
  async function updateCourse(id: string, input: any) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlUpdateCourse({ id, input })
      return data.updateCourse
    }, 'updateCourse')
  }

  /**
   * Delete course
   */
  async function deleteCourse(id: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlDeleteCourse({ id })
      return data.deleteCourse
    }, 'deleteCourse')
  }

  /**
   * Get all courses for admin
   */
  async function getAllCourses() {
    return withAuth(async () => {
      // TODO: Replace with proper GetAllCourses when backend implements it
      // @ts-ignore - Global function available after GraphQL code generation
      // const data = await GqlGetAllCourses()
      // return data.courses || []
      console.warn('getAllCourses: Backend query not implemented yet - returning empty array')
      return []
    }, 'getAllCourses', [])
  }

  /**
   * Get courses by semester
   */
  async function getCoursesBySemester(semester: string) {
    return withAuth(async () => {
      // TODO: Replace with proper GetCoursesBySemester when backend implements it
      // @ts-ignore - Global function available after GraphQL code generation
      // const data = await GqlGetCoursesBySemester({ semester })
      // return data.coursesBySemester || []
      console.warn(`getCoursesBySemester: Backend query not implemented yet - returning empty array for semester: ${semester}`)
      return []
    }, 'getCoursesBySemester', [])
  }

  /**
   * Get student information
   */
  async function getStudent(studentId: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlGetStudent({ id: studentId })
      return data.student
    }, 'getStudent')
  }

  /**
   * Update student information
   */
  async function updateStudent(id: string, input: any) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlUpdateStudent({ id, input })
      return data.updateStudent
    }, 'updateStudent')
  }

  /**
   * Get homework by course
   */
  async function getHomeworkByCourse(courseId: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlGetHomeworkByCourse({ courseId })
      return data.homeworkByCourse || []
    }, 'getHomeworkByCourse', [])
  }

  /**
   * Create homework
   */
  async function createHomework(input: any) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlCreateHomework({ input })
      return data.createHomework
    }, 'createHomework')
  }

  /**
   * Get announcements by course
   */
  async function GetAnnouncementsByCourse(courseId: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlGetAnnouncementsByCourse({ courseId })
      return data.announcementsByCourse || []
    }, 'GetAnnouncementsByCourse', [])
  }

  /**
   * Send chat message with history
   */
  async function sendChatMessage(input: {
    newMessage: string
    chatHistory: Array<{ role: string; content: string }>
    context: {
      userId: string
      userRole: string
      courseId?: string
      sessionId: string
      userName?: string
      isAuthenticated?: boolean
    }
  }) {
    return withAuth(async () => {
      try {
        // @ts-ignore - Global function available after GraphQL code generation
        const data = await GqlSendChatMessage({ input })
        return data.sendChatWithHistory
      } catch (error: any) {
        // Handle case where backend doesn't have chat mutation implemented yet
        if (error?.message?.includes('Cannot query field') || 
            error?.message?.includes('sendChatWithHistory') ||
            error?.gqlErrors?.[0]?.message?.includes('Cannot query field')) {
          throw new Error('Chat functionality is not yet implemented on the backend. The frontend is ready!')
        }
        throw error
      }
    }, 'sendChatMessage')
  }

  /**
   * Create a new student
   */
  async function createStudent(input: any) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlCreateStudent({ input })
      return data.createStudent
    }, 'createStudent')
  }

  /**
   * Delete student
   */
  async function deleteStudent(id: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlDeleteStudent({ id })
      return data.deleteStudent
    }, 'deleteStudent')
  }

  /**
   * Get all students for admin
   */
  async function getAllStudents() {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlGetAllStudents()
      return data.students || []
    }, 'getAllStudents', [])
  }

  /**
   * Add student to course (enrollment)
   */
  async function addStudentToCourse(courseId: string, studentId: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlAddStudentToCourse({ courseId, studentId })
      return data.addStudentToCourse
    }, 'addStudentToCourse')
  }

  /**
   * Remove student from course (unenrollment)
   */
  async function removeStudentFromCourse(courseId: string, studentId: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlRemoveStudentFromCourse({ courseId, studentId })
      return data.removeStudentFromCourse
    }, 'removeStudentFromCourse')
  }

  /**
   * Get course students (enrollments)
   */
  async function getCourseStudents(courseId: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlGetCourseStudents({ courseId })
      return data.courseStudents || []
    }, 'getCourseStudents', [])
  }

  /**
   * Create announcement
   */
  async function createAnnouncement(input: any) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlCreateAnnouncement({ input })
      return data.createAnnouncement
    }, 'createAnnouncement')
  }

  /**
   * Delete announcement
   */
  async function deleteAnnouncement(courseId: string, announcementId: string) {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlDeleteAnnouncement({ courseId, announcementId })
      return data.deleteAnnouncement
    }, 'deleteAnnouncement')
  }

  /**
   * Get all announcements for admin
   */
  async function getAllAnnouncements() {
    return withAuth(async () => {
      // @ts-ignore - Global function available after GraphQL code generation
      const data = await GqlGetAllAnnouncements()
      return data.announcements || []
    }, 'getAllAnnouncements', [])
  }

  return {
    // Authentication state
    isAuthenticated,
    loading,
    error,
    
    // Course operations
    getCourses,
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Grade operations
    getGrades,
    
    // Course management
    GetAnnouncementsByCourse,
    
    // Student operations
    getStudent,
    updateStudent,
    getAllStudents,
    createStudent,
    deleteStudent,
    
    // Enrollment operations
    addStudentToCourse,
    removeStudentFromCourse,
    getCourseStudents,
    
    // Announcement operations
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    
    // Homework operations
    getHomeworkByCourse,
    createHomework,
    
    // Chat operations
    sendChatMessage,
    
    // Utility functions
    refreshTokenIfNeeded,
    
    // New functions
    getCoursesBySemester
  }
} 