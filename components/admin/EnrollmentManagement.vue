<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-foreground">Enrollment Management</h2>
      <button
        @click="showCreateModal = true"
        class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
      >
        Enroll Student
      </button>
    </div>

    <!-- Filters -->
    <div class="flex space-x-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by student name or ID..."
          class="w-full border border-input bg-background px-3 py-2 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div class="w-48">
        <select
          v-model="selectedCourse"
          class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Courses</option>
          <option v-for="course in courses" :key="course.id" :value="course.name">{{ course.name }}</option>
        </select>
      </div>
    </div>

    <!-- Enrollments List -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="mt-2 text-muted-foreground">Loading enrollments...</p>
    </div>

    <div v-else-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive">Error loading enrollments: {{ error.message }}</p>
      <button
        @click="loadData()"
        class="mt-2 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90"
      >
        Retry
      </button>
    </div>

    <div v-else class="bg-card shadow rounded-lg overflow-hidden border border-border">
      <table class="min-w-full divide-y divide-border">
        <thead class="bg-muted/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Student
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Course
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Enrollment Date
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-card divide-y divide-border">
          <tr v-for="enrollment in filteredEnrollments" :key="enrollment.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-foreground">{{ enrollment.studentName }}</div>
                <div class="text-sm text-muted-foreground">ID: {{ enrollment.studentId }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
              {{ enrollment.course }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              {{ formatDate(enrollment.enrollmentDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  enrollment.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                ]"
              >
                {{ enrollment.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="toggleEnrollmentStatus(enrollment)"
                class="text-primary hover:text-primary/80"
              >
                {{ enrollment.status === 'active' ? 'Suspend' : 'Activate' }}
              </button>
              <button
                @click="deleteEnrollment(enrollment)"
                class="text-destructive hover:text-destructive/80"
              >
                Remove
              </button>
            </td>
          </tr>
          <tr v-if="filteredEnrollments.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-muted-foreground">
              {{ searchQuery || selectedCourse ? 'No enrollments found matching your filters.' : 'No enrollments found. Enroll your first student!' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Enrollment Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg p-6 w-full max-w-md mx-4 border border-border">
        <h3 class="text-lg font-semibold mb-4 text-foreground">Enroll Student</h3>
        
        <form @submit.prevent="submitEnrollment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Student ID</label>
            <input
              v-model="enrollmentForm.studentId"
              type="text"
              required
              class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="123456789"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Student Name</label>
            <input
              v-model="enrollmentForm.studentName"
              type="text"
              required
              class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Course</label>
            <select
              v-model="enrollmentForm.course"
              required
              class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a course</option>
              <option v-for="course in courses" :key="course.id" :value="course.name">{{ course.name }}</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="cancelEnrollmentForm"
              class="px-4 py-2 text-foreground border border-input rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {{ submitting ? 'Enrolling...' : 'Enroll' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'
import { useAuth } from '~/composables/useAuth'

interface Enrollment {
  id: string
  studentName: string
  studentId: string
  course: string
  courseId: string
  enrollmentDate: Date
  status: 'active' | 'suspended'
}

interface Course {
  id: string
  name: string
  semester: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
}

// Composables
const graphql = useGraphQL()
const { isAuthenticated, userId } = useAuth()

// State
const enrollments = ref<Enrollment[]>([])
const courses = ref<Course[]>([])
const students = ref<Student[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)
const submitting = ref(false)
const searchQuery = ref('')
const selectedCourse = ref('')

// Modal state
const showCreateModal = ref(false)

// Form data
const enrollmentForm = reactive({
  studentId: '',
  studentName: '',
  course: ''
})

// Computed
const filteredEnrollments = computed(() => {
  let filtered = enrollments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(enrollment => 
      enrollment.studentName.toLowerCase().includes(query) ||
      enrollment.studentId.toLowerCase().includes(query)
    )
  }

  if (selectedCourse.value) {
    filtered = filtered.filter(enrollment => enrollment.course === selectedCourse.value)
  }

  return filtered
})

// Methods
async function loadData() {
  if (!isAuthenticated.value) {
    return
  }

  loading.value = true
  error.value = null
  
  try {
    // Load courses and students
    const [coursesData, studentsData] = await Promise.all([
      graphql.getAllCourses(),
      graphql.getAllStudents()
    ])
    
    courses.value = coursesData
    students.value = studentsData
    
    // Build enrollments from course-student relationships
    const enrollmentPromises = coursesData.map(async (course: Course) => {
      try {
        const courseStudents = await graphql.getCourseStudents(course.id)
        return courseStudents.map((student: Student) => ({
          id: `${student.id}-${course.id}`,
          studentName: `${student.firstName} ${student.lastName}`,
          studentId: student.id,
          course: course.name,
          courseId: course.id,
          enrollmentDate: new Date(), // In real app, this would come from enrollment table
          status: 'active' as const
        }))
      } catch (err) {
        console.warn(`Failed to load students for course ${course.name}:`, err)
        return []
      }
    })
    
    const enrollmentResults = await Promise.all(enrollmentPromises)
    enrollments.value = enrollmentResults.flat()
    
  } catch (err) {
    error.value = err as Error
    console.error('Error loading data:', err)
    // Fallback data
    courses.value = [
      { id: '1', name: 'Yearly Project', semester: 'Spring 2024' },
      { id: '2', name: 'Deep Learning', semester: 'Winter 2025' },
      { id: '3', name: 'Software Engineering', semester: 'Fall 2024' }
    ]
    enrollments.value = [
      {
        id: '1',
        studentName: 'John Doe',
        studentId: '123456789',
        course: 'Yearly Project',
        courseId: '1',
        enrollmentDate: new Date('2024-01-01'),
        status: 'active'
      },
      {
        id: '2',
        studentName: 'Jane Smith',
        studentId: '987654321',
        course: 'Deep Learning',
        courseId: '2',
        enrollmentDate: new Date('2024-01-05'),
        status: 'active'
      },
      {
        id: '3',
        studentName: 'Mike Johnson',
        studentId: '456789123',
        course: 'Yearly Project',
        courseId: '1',
        enrollmentDate: new Date('2024-01-03'),
        status: 'suspended'
      }
    ]
  } finally {
    loading.value = false
  }
}

async function toggleEnrollmentStatus(enrollment: Enrollment) {
  // In a real implementation, this would update the enrollment status in the database
  // For now, just toggle locally
  enrollment.status = enrollment.status === 'active' ? 'suspended' : 'active'
}

async function deleteEnrollment(enrollment: Enrollment) {
  if (confirm(`Are you sure you want to remove ${enrollment.studentName} from ${enrollment.course}?`)) {
    try {
      await graphql.removeStudentFromCourse(enrollment.courseId, enrollment.studentId)
      enrollments.value = enrollments.value.filter(e => e.id !== enrollment.id)
    } catch (err) {
      error.value = err as Error
      console.error('Error removing enrollment:', err)
    }
  }
}

async function submitEnrollment() {
  if (!isAuthenticated.value) {
    error.value = new Error('You must be authenticated to perform this action')
    return
  }

  submitting.value = true
  
  try {
    // Find the course
    const course = courses.value.find(c => c.name === enrollmentForm.course)
    if (!course) {
      throw new Error('Course not found')
    }
    
    // Find or create student by ID
    let student = students.value.find(s => s.id === enrollmentForm.studentId)
    if (!student) {
      // In a real implementation, you might want to create the student first
      // For now, we'll use the form data
      student = {
        id: enrollmentForm.studentId,
        firstName: enrollmentForm.studentName.split(' ')[0] || '',
        lastName: enrollmentForm.studentName.split(' ').slice(1).join(' ') || '',
        email: `${enrollmentForm.studentId}@technion.ac.il`
      }
    }
    
    await graphql.addStudentToCourse(course.id, enrollmentForm.studentId)
    
    const newEnrollment: Enrollment = {
      id: `${enrollmentForm.studentId}-${course.id}`,
      studentName: enrollmentForm.studentName,
      studentId: enrollmentForm.studentId,
      course: course.name,
      courseId: course.id,
      enrollmentDate: new Date(),
      status: 'active'
    }
    
    enrollments.value.unshift(newEnrollment)
    cancelEnrollmentForm()
  } catch (err) {
    error.value = err as Error
    console.error('Error creating enrollment:', err)
  } finally {
    submitting.value = false
  }
}

function cancelEnrollmentForm() {
  showCreateModal.value = false
  Object.assign(enrollmentForm, {
    studentId: '',
    studentName: '',
    course: ''
  })
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script> 