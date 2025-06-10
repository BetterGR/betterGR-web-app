<template>
  <!-- Custom layout for full width -->
  <div class="min-h-screen flex flex-col bg-background">
    <TheHeader />
    <main class="flex-1">
      <!-- Hero Section - True Full Width -->
      <div v-if="courseInfo" class="hero-section bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div class="container mx-auto px-4 py-12">
          <div class="max-w-4xl">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-blue-100 text-sm mb-6">
              <NuxtLink to="/" class="hover:text-white transition-colors">Home</NuxtLink>
            <ChevronRight class="h-4 w-4" />
              <NuxtLink to="/courses" class="hover:text-white transition-colors">Courses</NuxtLink>
            <ChevronRight class="h-4 w-4" />
              <span class="text-white">{{ courseInfo.title }}</span>
            </nav>
            
            <!-- Course Header -->
            <div class="mb-8">
              <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ courseInfo.title }}</h1>
              <p v-if="markdownContent?.courseMeta" class="text-xl text-blue-100 mb-6">
                {{ markdownContent.courseMeta.instructor }} • {{ markdownContent.courseMeta.semester }} • {{ markdownContent.courseMeta.credits }} Credits
              </p>
            </div>
            
            <!-- Course Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div class="text-2xl font-bold">{{ markdownContent?.courseMeta?.credits || '4' }}</div>
                <div class="text-sm text-blue-100">Credits</div>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div class="text-2xl font-bold">8</div>
                <div class="text-sm text-blue-100">Weeks</div>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div class="text-2xl font-bold">{{ courseInfo.id }}</div>
                <div class="text-sm text-blue-100">Course ID</div>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div class="text-2xl font-bold">{{ markdownContent?.courseMeta?.semester || courseInfo.semester }}</div>
                <div class="text-sm text-blue-100">Semester</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div v-if="courseInfo" class="bg-gray-50 dark:bg-gray-900 min-h-screen w-full">
        <div class="w-full px-4 py-8">
          <div class="flex flex-col lg:flex-row gap-8 max-w-full">
            <!-- Sidebar Navigation -->
            <div class="lg:w-1/4 w-full">
              <div class="sticky top-8">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Course Sections</h3>
                  <nav class="space-y-2">
                    <a v-for="section in courseSections" 
                       :key="section.id"
                       :href="`#${section.id}`"
                       @click="scrollToSection(section.id)"
                       class="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                       :class="{ 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30': activeSection === section.id }">
                      {{ section.title }}
                    </a>
                  </nav>
                </div>
              </div>
            </div>
            
            <!-- Main Content Area -->
            <div class="lg:w-3/4 w-full">
              <div v-if="markdownContent" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <!-- Content Sections -->
                <div class="prose prose-lg dark:prose-invert max-w-none p-8 text-gray-900 dark:text-gray-100">
                  <ContentRenderer :value="markdownContent" />
                </div>
              </div>
              
              <!-- Loading State -->
              <div v-else-if="contentLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <div class="flex items-center justify-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span class="text-gray-600 dark:text-gray-300">Loading course content...</span>
                </div>
              </div>
                
              <!-- Content Error -->
              <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <div class="text-center py-12">
                  <div class="text-yellow-600 dark:text-yellow-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Content Loading</h3>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">Course content is being prepared...</p>
                  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left max-w-md mx-auto">
                    <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Course Information</h4>
                    <p class="text-gray-700 dark:text-gray-300"><strong>Course:</strong> {{ courseInfo.title }}</p>
                    <p class="text-gray-700 dark:text-gray-300"><strong>ID:</strong> {{ courseInfo.id }}</p>
                    <p class="text-gray-700 dark:text-gray-300"><strong>Semester:</strong> {{ courseInfo.semester }}</p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
        
      <!-- Course Not Found -->
      <div v-else class="bg-gray-50 dark:bg-gray-900 min-h-screen w-full">
        <div class="w-full px-4 py-16">
          <div class="max-w-md mx-auto text-center">
            <div class="text-red-600 dark:text-red-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">The course "<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ slug }}</code>" could not be found.</p>
            <NuxtLink to="/courses" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Back to Courses
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ChevronRight, ArrowLeft } from 'lucide-vue-next'
import { useCourses } from '~/composables/useCourses'
import TheHeader from '~/components/TheHeader.vue'

definePageMeta({
  name: 'course-detail',
  layout: false // Use no layout to avoid width constraints
})

const route = useRoute()
const slug = computed(() => {
  return Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
})

// Get courses from GraphQL
const { courses, fetchCourses } = useCourses()

// Content loading state
const contentLoading = ref(true)
const markdownContent = ref(null)
const activeSection = ref('')

// Load courses on mount
onMounted(async () => {
  await fetchCourses()
  await loadMarkdownContent()
})

// Find the course that matches our slug
const courseInfo = computed(() => {
  return courses.value.find(course => course.slug === slug.value)
})

// Load markdown content
async function loadMarkdownContent() {
  if (!slug.value) return
  
  try {
    contentLoading.value = true
    
    // Use Nuxt Content v3 API with the courses collection
    const content = await queryCollection('courses').path(`/courses/${slug.value}`).first()
    
    if (content) {
      markdownContent.value = content
    }
  } catch (error) {
    console.error('Error loading markdown content:', error)
  } finally {
    contentLoading.value = false
  }
}

// Generate course sections for navigation
const courseSections = computed(() => {
  if (markdownContent.value?.courseMeta?.sections) {
    // Use sections from the markdown file's frontmatter
    return markdownContent.value.courseMeta.sections.map(section => ({
      id: section,
      title: section.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }))
  }
  
  // Default sections if no content is loaded yet or sections are not defined
  return [
    { id: 'course-overview', title: 'Course Overview' },
    { id: 'learning-objectives', title: 'Learning Objectives' },
    { id: 'topics-covered', title: 'Topics Covered' },
    { id: 'course-schedule', title: 'Course Schedule' },
    { id: 'assessment', title: 'Assessment' },
    { id: 'required-textbooks', title: 'Required Textbooks' },
    { id: 'assignments', title: 'Assignments' },
    { id: 'resources', title: 'Resources' }
  ]
})

// Scroll to section functionality
function scrollToSection(sectionId) {
  activeSection.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Watch for scroll to update active section
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
      }
    })
  }, { threshold: 0.5 })

  // Observe all section headings
  nextTick(() => {
    courseSections.value.forEach(section => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })
  })
})
</script>

<style scoped>
/* Ensure full width banner */
.hero-section {
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  width: 100vw;
}

/* Maximum specificity dark mode overrides */
.prose.prose-lg.dark\:prose-invert .prose *,
.prose.prose-lg *,
:deep(.prose.prose-lg *),
:deep(.prose *) {
  color: inherit !important;
}

/* Base prose colors with maximum specificity */
.prose.prose-lg {
  color: rgb(17, 24, 39) !important; /* black in light mode */
}

html.dark .prose.prose-lg,
.dark .prose.prose-lg,
:deep(.dark .prose) {
  color: rgb(243, 244, 246) !important; /* white in dark mode */
}

/* Headings with absolute override */
.prose.prose-lg h1,
.prose.prose-lg h2, 
.prose.prose-lg h3,
.prose.prose-lg h4,
.prose.prose-lg h5,
.prose.prose-lg h6,
:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6) {
  color: rgb(17, 24, 39) !important; /* black */
  font-weight: 700 !important;
}

html.dark .prose.prose-lg h1,
html.dark .prose.prose-lg h2,
html.dark .prose.prose-lg h3,
html.dark .prose.prose-lg h4,
html.dark .prose.prose-lg h5,
html.dark .prose.prose-lg h6,
.dark .prose.prose-lg h1,
.dark .prose.prose-lg h2,
.dark .prose.prose-lg h3,
.dark .prose.prose-lg h4,
.dark .prose.prose-lg h5,
.dark .prose.prose-lg h6,
:deep(.dark .prose h1),
:deep(.dark .prose h2),
:deep(.dark .prose h3),
:deep(.dark .prose h4),
:deep(.dark .prose h5),
:deep(.dark .prose h6) {
  color: rgb(255, 255, 255) !important; /* white */
}

/* Body text with absolute override */
.prose.prose-lg p,
.prose.prose-lg li,
.prose.prose-lg td,
.prose.prose-lg span,
.prose.prose-lg div,
:deep(.prose p),
:deep(.prose li),
:deep(.prose td),
:deep(.prose span),
:deep(.prose div) {
  color: rgb(55, 65, 81) !important; /* gray-700 */
}

html.dark .prose.prose-lg p,
html.dark .prose.prose-lg li,
html.dark .prose.prose-lg td,
html.dark .prose.prose-lg span,
html.dark .prose.prose-lg div,
.dark .prose.prose-lg p,
.dark .prose.prose-lg li,
.dark .prose.prose-lg td,
.dark .prose.prose-lg span,
.dark .prose.prose-lg div,
:deep(.dark .prose p),
:deep(.dark .prose li),
:deep(.dark .prose td),
:deep(.dark .prose span),
:deep(.dark .prose div) {
  color: rgb(229, 231, 235) !important; /* gray-200 */
}

/* Links as requested - bold and underlined */
.prose.prose-lg a,
:deep(.prose a) {
  color: rgb(17, 24, 39) !important; /* black */
  font-weight: 700 !important;
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
}

html.dark .prose.prose-lg a,
.dark .prose.prose-lg a,
:deep(.dark .prose a) {
  color: rgb(255, 255, 255) !important; /* white */
}

/* Strong/bold text */
.prose.prose-lg strong,
.prose.prose-lg b,
:deep(.prose strong),
:deep(.prose b) {
  color: rgb(17, 24, 39) !important; /* black */
  font-weight: 700 !important;
}

html.dark .prose.prose-lg strong,
html.dark .prose.prose-lg b,
.dark .prose.prose-lg strong,
.dark .prose.prose-lg b,
:deep(.dark .prose strong),
:deep(.dark .prose b) {
  color: rgb(255, 255, 255) !important; /* white */
}

/* Tables */
.prose.prose-lg table,
:deep(.prose table) {
  border: 2px solid rgb(209, 213, 219) !important; /* gray-300 */
}

html.dark .prose.prose-lg table,
.dark .prose.prose-lg table,
:deep(.dark .prose table) {
  border-color: rgb(75, 85, 99) !important; /* gray-600 */
}

.prose.prose-lg th,
:deep(.prose th) {
  background-color: rgb(243, 244, 246) !important; /* gray-100 */
  color: rgb(17, 24, 39) !important; /* black */
  font-weight: 700 !important;
  border-bottom: 2px solid rgb(209, 213, 219) !important;
}

html.dark .prose.prose-lg th,
.dark .prose.prose-lg th,
:deep(.dark .prose th) {
  background-color: rgb(55, 65, 81) !important; /* gray-700 */
  color: rgb(255, 255, 255) !important; /* white */
  border-bottom-color: rgb(75, 85, 99) !important;
}

/* Code */
.prose.prose-lg code,
:deep(.prose code) {
  background-color: rgb(243, 244, 246) !important; /* gray-100 */
  color: rgb(17, 24, 39) !important; /* black */
  padding: 0.25rem 0.5rem !important;
  border-radius: 0.375rem !important;
}

html.dark .prose.prose-lg code,
.dark .prose.prose-lg code,
:deep(.dark .prose code) {
  background-color: rgb(55, 65, 81) !important; /* gray-700 */
  color: rgb(243, 244, 246) !important; /* white */
}
</style> 