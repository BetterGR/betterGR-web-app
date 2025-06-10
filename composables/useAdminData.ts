import { ref, computed } from 'vue'
import { useGraphQL } from './useGraphQL.js'
import { useAuth } from './useAuth.js'

interface Course {
  id: string
  name: string
  semester: string
  description?: string
}

interface Announcement {
  id: string
  title: string
  content: string
  courseId: string
  priority: boolean
  createdAt: Date
}

export function useAdminData() {
  const graphql = useGraphQL()
  const { isAuthenticated } = useAuth()

  // Shared state
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const courses = ref<Course[]>([])
  const announcements = ref<Announcement[]>([])
  const selectedSemester = ref<string>('')

  // Computed properties
  const availableSemesters = computed(() => {
    const semesters = [...new Set(courses.value.map(course => course.semester))]
    return semesters.sort()
  })

  const filteredCourses = computed(() => {
    if (!selectedSemester.value) {
      return courses.value
    }
    return courses.value.filter(course => course.semester === selectedSemester.value)
  })

  const recentAnnouncements = computed(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return announcements.value
      .filter(a => a.createdAt >= sevenDaysAgo)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
  })

  // Auto-select first semester when courses are loaded
  const autoSelectFirstSemester = () => {
    if (availableSemesters.value.length > 0 && !selectedSemester.value) {
      selectedSemester.value = availableSemesters.value[0]
    }
  }

  // Utility functions
  const getCourseAnnouncements = (courseId: string): Announcement[] => {
    return announcements.value.filter(a => a.courseId === courseId)
  }

  const getCourseName = (courseId: string): string => {
    const course = courses.value.find(c => c.id === courseId)
    return course ? course.name : 'Unknown Course'
  }

  const getCourseAnnouncementsCount = (courseId: string): number => {
    return announcements.value.filter(a => a.courseId === courseId).length
  }

  // Data loading functions
  const loadCourses = async () => {
    if (!isAuthenticated.value) {
      throw new Error('User must be authenticated')
    }

    try {
      let data
      if (selectedSemester.value) {
        // Load courses for specific semester
        data = await graphql.getCoursesBySemester(selectedSemester.value)
      } else {
        // Load all courses to get available semesters
        data = await graphql.getAllCourses()
      }
      courses.value = data || []
      autoSelectFirstSemester()
    } catch (err) {
      console.error('Error loading courses:', err)
      throw err
    }
  }

  // Load courses when semester selection changes
  const loadCoursesForSemester = async (semester: string) => {
    selectedSemester.value = semester
    loading.value = true
    error.value = null
    
    try {
      const data = await graphql.getCoursesBySemester(semester)
      courses.value = data || []
    } catch (err) {
      error.value = err as Error
      console.error('Error loading courses for semester:', err)
    } finally {
      loading.value = false
    }
  }

  const loadAllAnnouncements = async () => {
    if (!courses.value.length) {
      announcements.value = []
      return
    }

    try {
      const allAnnouncements: Announcement[] = []
      
      for (const course of courses.value) {
        try {
          const courseAnnouncements = await graphql.GetAnnouncementsByCourse(course.id)
          if (courseAnnouncements && Array.isArray(courseAnnouncements)) {
            const formattedAnnouncements = courseAnnouncements.map((announcement: any) => ({
              id: announcement.id,
              title: announcement.title,
              content: announcement.content,
              courseId: course.id,
              priority: announcement.priority || false,
              createdAt: new Date(announcement.createdAt || Date.now())
            }))
            allAnnouncements.push(...formattedAnnouncements)
          }
        } catch (err) {
          console.warn(`Failed to load announcements for course ${course.name}:`, err)
          // Continue with other courses even if one fails
        }
      }
      
      announcements.value = allAnnouncements
    } catch (err) {
      console.error('Error loading announcements:', err)
      throw err
    }
  }

  const loadAllData = async () => {
    if (!isAuthenticated.value) {
      error.value = new Error('Authentication required')
      return
    }

    loading.value = true
    error.value = null
    
    try {
      // Load courses first
      await loadCourses()
      
      // Auto-select first semester after courses are loaded
      autoSelectFirstSemester()
      
      // Then load announcements for those courses
      await loadAllAnnouncements()
    } catch (err) {
      error.value = err as Error
      console.error('Error loading admin data:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshData = () => loadAllData()

  // Course management
  const createCourse = async (courseData: Omit<Course, 'id'>) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required')
    }

    try {
      const newCourse = await graphql.createCourse(courseData)
      courses.value.push(newCourse)
      return newCourse
    } catch (err) {
      console.error('Error creating course:', err)
      throw err
    }
  }

  const updateCourse = async (courseId: string, courseData: Partial<Course>) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required')
    }

    try {
      const updatedCourse = await graphql.updateCourse(courseId, courseData)
      const index = courses.value.findIndex(c => c.id === courseId)
      if (index !== -1) {
        courses.value[index] = updatedCourse
      }
      return updatedCourse
    } catch (err) {
      console.error('Error updating course:', err)
      throw err
    }
  }

  const deleteCourse = async (courseId: string) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required')
    }

    try {
      await graphql.deleteCourse(courseId)
      courses.value = courses.value.filter(c => c.id !== courseId)
      // Also remove announcements for this course
      announcements.value = announcements.value.filter(a => a.courseId !== courseId)
    } catch (err) {
      console.error('Error deleting course:', err)
      throw err
    }
  }

  // Announcement management
  const createAnnouncement = async (announcementData: { courseId: string; title: string; content: string; priority?: boolean }) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required')
    }

    try {
      const newAnnouncement = await graphql.createAnnouncement(announcementData)
      const formattedAnnouncement: Announcement = {
        id: newAnnouncement.id,
        title: newAnnouncement.title,
        content: announcementData.content,
        courseId: announcementData.courseId,
        priority: announcementData.priority || false,
        createdAt: new Date()
      }
      announcements.value.unshift(formattedAnnouncement)
      return formattedAnnouncement
    } catch (err) {
      console.error('Error creating announcement:', err)
      throw err
    }
  }

  const deleteAnnouncement = async (courseId: string, announcementId: string) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required')
    }

    try {
      await graphql.deleteAnnouncement(courseId, announcementId)
      announcements.value = announcements.value.filter(a => a.id !== announcementId)
    } catch (err) {
      console.error('Error deleting announcement:', err)
      throw err
    }
  }

  return {
    // State
    loading,
    error,
    courses,
    announcements,
    selectedSemester,
    
    // Computed
    availableSemesters,
    filteredCourses,
    recentAnnouncements,
    
    // Utility functions
    getCourseAnnouncements,
    getCourseName,
    getCourseAnnouncementsCount,
    autoSelectFirstSemester,
    
    // Data loading
    loadAllData,
    loadCourses,
    loadCoursesForSemester,
    loadAllAnnouncements,
    refreshData,
    
    // Course management
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Announcement management
    createAnnouncement,
    deleteAnnouncement
  }
} 