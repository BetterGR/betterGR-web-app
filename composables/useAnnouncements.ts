import { ref, computed } from 'vue'
import { useGraphQL } from './useGraphQL.js'
import { useAuth } from './useAuth.js'
import type { Course } from './useCourses.js'

/**
 * Announcement interface
 */
export interface Announcement {
  id: string
  courseId: string
  courseName?: string
  title: string
  content: string
  createdAt?: string
}

/**
 * Announcements composable for managing course announcements
 */
export function useAnnouncements() {
  const { isAuthenticated } = useAuth()
  const graphql = useGraphQL()
  
  // State
  const announcements = ref<Announcement[]>([])
  const recentAnnouncements = ref<Announcement[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  /**
   * Fetch announcements for a specific course
   */
  async function fetchCourseAnnouncements(courseId: string): Promise<Announcement[]> {
    if (!isAuthenticated.value) {
      throw new Error('User not authenticated')
    }
    
    try {
      const data = await graphql.GetAnnouncementsByCourse(courseId)
      
      // The GraphQL function now returns the announcements array directly (after extracting from announcementsByCourse)
      const announcements = Array.isArray(data) ? data : []
      
      const processedAnnouncements = announcements.map((announcement: any) => ({
        id: announcement.id,
        courseId,
        title: announcement.title,
        content: announcement.content,
        // Use the actual createdAt from GraphQL response if available
        createdAt: announcement.createdAt || new Date().toISOString()
      }))
      
      return processedAnnouncements
    } catch (err) {
      console.error(`Error fetching announcements for course ${courseId}:`, err)
      throw err
    }
  }
  
  /**
   * Fetch recent announcements from multiple courses
   * Gets the most recent announcement from each course
   */
  async function fetchRecentAnnouncementsFromCourses(courses: Course[]) {
    if (!isAuthenticated.value || courses.length === 0) {
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      // Create promises for all course announcement fetches to run in parallel
      const coursePromises = courses.map(async (course) => {
        try {
          const courseAnnouncements = await fetchCourseAnnouncements(course.id)
          
          // Add course name to each announcement and return them
          return courseAnnouncements.map(announcement => ({
            ...announcement,
            courseName: course.name || course.title,
            title: `${course.name || course.title}: ${announcement.title}`
          }))
        } catch (error) {
          console.warn(`Failed to fetch announcements for course ${course.name}:`, error)
          // Return empty array for this course if it fails
          return []
        }
      })
      
      // Wait for all promises to complete in parallel
      const courseAnnouncementResults = await Promise.all(coursePromises)
      
      // Flatten all announcements into a single array
      const allAnnouncements = courseAnnouncementResults.flat()
      
      // Group announcements by course and get the most recent from each
      const courseAnnouncementMap = new Map<string, Announcement>()
      
      allAnnouncements.forEach(announcement => {
        const existing = courseAnnouncementMap.get(announcement.courseId)
        
        // Compare by createdAt timestamp if available, otherwise fall back to ID comparison
        const isMoreRecent = !existing || (
          announcement.createdAt && existing.createdAt 
            ? new Date(announcement.createdAt) > new Date(existing.createdAt)
            : announcement.id > existing.id
        )
        
        if (isMoreRecent) {
          courseAnnouncementMap.set(announcement.courseId, announcement)
        }
      })
      
      // Convert to array, sort by creation date (most recent first), and limit to 5
      recentAnnouncements.value = Array.from(courseAnnouncementMap.values())
        .sort((a, b) => {
          // Sort by createdAt if available, otherwise by ID
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return b.id.localeCompare(a.id)
        })
        .slice(0, 5) // Limit to 5 most recent announcements
      
    } catch (err) {
      console.error('Error fetching recent announcements:', err)
      error.value = err instanceof Error ? err : new Error('Failed to fetch announcements')
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch all announcements for multiple courses
   */
  async function fetchAllAnnouncementsFromCourses(courses: Course[]) {
    if (!isAuthenticated.value || courses.length === 0) {
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      // Create promises for all course announcement fetches to run in parallel
      const coursePromises = courses.map(async (course) => {
        try {
          const courseAnnouncements = await fetchCourseAnnouncements(course.id)
          
          // Add course name to each announcement and return them
          return courseAnnouncements.map(announcement => ({
            ...announcement,
            courseName: course.name || course.title,
            title: `${course.name || course.title}: ${announcement.title}`
          }))
        } catch (error) {
          console.warn(`Failed to fetch announcements for course ${course.name}:`, error)
          // Return empty array for this course if it fails
          return []
        }
      })
      
      // Wait for all promises to complete in parallel
      const courseAnnouncementResults = await Promise.all(coursePromises)
      
      // Flatten all announcements into a single array
      const allAnnouncements = courseAnnouncementResults.flat()
      
      // Sort all announcements by creation date (most recent first)
      announcements.value = allAnnouncements.sort((a, b) => {
        // Sort by createdAt if available, otherwise by ID
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return b.id.localeCompare(a.id)
      })
      
    } catch (err) {
      console.error('Error fetching all announcements:', err)
      error.value = err instanceof Error ? err : new Error('Failed to fetch announcements')
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Clear all announcements
   */
  function clearAnnouncements() {
    announcements.value = []
    recentAnnouncements.value = []
    error.value = null
  }
  
  /**
   * Get announcements for a specific course
   */
  const getAnnouncementsForCourse = computed(() => {
    return (courseId: string) => announcements.value.filter(a => a.courseId === courseId)
  })
  
  return {
    // State
    announcements,
    recentAnnouncements,
    loading,
    error,
    
    // Methods
    fetchCourseAnnouncements,
    fetchRecentAnnouncementsFromCourses,
    fetchAllAnnouncementsFromCourses,
    clearAnnouncements,
    
    // Computed
    getAnnouncementsForCourse
  }
} 