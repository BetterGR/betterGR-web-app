<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-foreground">Student Management</h2>
      <button
        @click="showCreateModal = true"
        class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
      >
        Add New Student
      </button>
    </div>

    <!-- Search -->
    <div class="max-w-md">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search students..."
        class="w-full border border-input bg-background px-3 py-2 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <!-- Students List -->
    <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
      <p class="text-destructive">{{ error.message }}</p>
      <button
        @click="loadStudents()"
        class="mt-2 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90"
      >
        Retry
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="mt-2 text-muted-foreground">Loading students...</p>
    </div>

    <div v-else class="bg-card shadow rounded-lg overflow-hidden border border-border">
      <table class="min-w-full divide-y divide-border">
        <thead class="bg-muted/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Phone
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-card divide-y divide-border">
          <tr v-for="student in filteredStudents" :key="student.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
              {{ student.firstName }} {{ student.lastName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              {{ student.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              {{ student.phoneNumber || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="editStudent(student)"
                class="text-primary hover:text-primary/80"
              >
                Edit
              </button>
              <button
                @click="deleteStudent(student)"
                class="text-destructive hover:text-destructive/80"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="filteredStudents.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-muted-foreground">
              {{ searchQuery ? 'No students found matching your search.' : 'No students found. Add your first student!' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Student Modal -->
    <div v-if="showCreateModal || editingStudent" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg p-6 w-full max-w-md mx-4 border border-border">
        <h3 class="text-lg font-semibold mb-4 text-foreground">
          {{ editingStudent ? 'Edit Student' : 'Add New Student' }}
        </h3>
        
        <form @submit.prevent="submitStudent" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">First Name</label>
              <input
                v-model="studentForm.firstName"
                type="text"
                required
                class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="John"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">Last Name</label>
              <input
                v-model="studentForm.lastName"
                type="text"
                required
                class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              v-model="studentForm.email"
              type="email"
              required
              class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="john.doe@example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Phone Number</label>
            <input
              v-model="studentForm.phoneNumber"
              type="tel"
              class="w-full border border-input bg-background rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="cancelStudentForm"
              class="px-4 py-2 text-foreground border border-input rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {{ submitting ? 'Saving...' : (editingStudent ? 'Update' : 'Add') }}
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

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
}

// Composables
const graphql = useGraphQL()
const { isAuthenticated } = useAuth()

// State
const students = ref<Student[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)
const submitting = ref(false)
const searchQuery = ref('')

// Modal state
const showCreateModal = ref(false)
const editingStudent = ref<Student | null>(null)

// Form data
const studentForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: ''
})

// Computed
const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value
  
  const query = searchQuery.value.toLowerCase()
  return students.value.filter(student => 
    student.firstName.toLowerCase().includes(query) ||
    student.lastName.toLowerCase().includes(query) ||
    student.email.toLowerCase().includes(query)
  )
})

// Methods
async function loadStudents() {
  if (!isAuthenticated.value) {
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const data = await graphql.getAllStudents()
    students.value = data
  } catch (err) {
    error.value = err as Error
    console.error('Error loading students:', err)
    // Fallback data for when GraphQL is not available
    students.value = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@technion.ac.il',
        phoneNumber: '+972-50-123-4567'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@technion.ac.il',
        phoneNumber: '+972-52-987-6543'
      }
    ]
  } finally {
    loading.value = false
  }
}

function editStudent(student: Student) {
  editingStudent.value = { ...student }
  Object.assign(studentForm, student)
  showCreateModal.value = true
}

async function deleteStudent(student: Student) {
  if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
    try {
      await graphql.deleteStudent(student.id)
      students.value = students.value.filter(s => s.id !== student.id)
    } catch (err) {
      error.value = err as Error
      console.error('Error deleting student:', err)
    }
  }
}

async function submitStudent() {
  if (!isAuthenticated.value) {
    error.value = new Error('You must be authenticated to perform this action')
    return
  }

  submitting.value = true
  
  try {
    if (editingStudent.value) {
      // Update existing student
      const updated = await graphql.updateStudent(editingStudent.value.id, {
        firstName: studentForm.firstName,
        lastName: studentForm.lastName,
        email: studentForm.email,
        phoneNumber: studentForm.phoneNumber
      })
      
      const index = students.value.findIndex(s => s.id === editingStudent.value!.id)
      if (index !== -1) {
        students.value[index] = updated
      }
    } else {
      // Create new student
      const created = await graphql.createStudent({
        firstName: studentForm.firstName,
        lastName: studentForm.lastName,
        email: studentForm.email,
        phoneNumber: studentForm.phoneNumber
      })
      
      students.value.push(created)
    }
    
    cancelStudentForm()
  } catch (err) {
    error.value = err as Error
    console.error('Error saving student:', err)
  } finally {
    submitting.value = false
  }
}

function cancelStudentForm() {
  showCreateModal.value = false
  editingStudent.value = null
  Object.assign(studentForm, {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  })
}

// Lifecycle
onMounted(() => {
  loadStudents()
})
</script> 