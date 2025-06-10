// Type declarations for auto-imported functions
declare function defineNuxtPlugin(fn: () => void): any
declare function useRoute(): any
declare function useChat(): any
declare function watch(source: any, callback: (value: any) => void, options?: any): any

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.server) return
  
  const route = useRoute()
  const { updateCourseContext } = useChat()
  
  // Update course context when route changes
  watch(() => route.params.courseId, (courseId: string | null) => {
    if (courseId) {
      console.log('Auto-updating course context to:', courseId)
      updateCourseContext(courseId as string)
    } else {
      // Clear course context when not in a course
      updateCourseContext(null)
    }
  }, { immediate: true })
}) 