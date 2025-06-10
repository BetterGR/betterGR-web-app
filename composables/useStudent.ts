import { ref, Ref } from 'vue'
import { useAuth } from './useAuth.js'
import { useGraphQL } from './useGraphQL.js'

export interface Student {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    createdAt?: string
    updatedAt?: string
}

export function useStudent() {
    const { userId, isAuthenticated, userName } = useAuth()
    const { getStudent, updateStudent, loading: graphqlLoading } = useGraphQL()
    
    // State
    const student: Ref<Student | null> = ref(null)
    const loading = ref(false)
    const error = ref<Error | null>(null)
    
    /**
     * Get display name from available data sources
     */
    function getDisplayName(): string {
        // Priority: student data > Keycloak userName > fallback
        if (student.value?.firstName && student.value?.lastName) {
            return `${student.value.firstName} ${student.value.lastName}`
        }
        
        if (userName.value) {
            return userName.value
        }
        
        return 'Student'
    }
    
    /**
     * Get first name from available data sources
     */
    function getFirstName(): string {
        // Priority: student data > extract from Keycloak userName > fallback
        if (student.value?.firstName) {
            return student.value.firstName
        }
        
        if (userName.value) {
            // Try to extract first name from full name
            const parts = userName.value.split(' ')
            return parts[0] || userName.value
        }
        
        return 'Student'
    }
    
    /**
     * Fetch student data for the current user
     */
    async function fetchStudent() {
        if (!isAuthenticated.value || !userId.value) {
            error.value = new Error('User not authenticated')
            return null
        }
        
        loading.value = true
        error.value = null
        
        try {
            // Get student from the GraphQL API
            const data = await getStudent(userId.value)
            
            if (data && data.id) {
                // Set the student value
                student.value = {
                    id: data.id || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                }
                
                return student.value
            } else {
                // Create a minimal student object from available auth data
                student.value = {
                    id: userId.value,
                    firstName: getFirstName(),
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                }
                return student.value
            }
            
        } catch (err) {
            // Create a fallback student object even on error
            student.value = {
                id: userId.value,
                firstName: getFirstName(),
                lastName: '',
                email: '',
                phoneNumber: '',
            }
            
            // Set error but don't clear student data
            error.value = err instanceof Error ? err : new Error(String(err))
            return student.value
            
        } finally {
            loading.value = false
        }
    }

    /**
     * Update student data
     */
    async function updateStudentReq(id: string, input: any) {
        if (!isAuthenticated.value || !userId.value) {
            error.value = new Error('User not authenticated')
            return
        }
        loading.value = true
        error.value = null
        try {
            const data = await updateStudent(id, input)
            
            // Update local student data
            if (data && student.value) {
                student.value = {
                    ...student.value,
                    ...data,
                }
            }
            
            return data
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err))
            throw err
        } finally {
            loading.value = false
        }
    }
    
    return {
        student,
        loading,
        error,
        fetchStudent,
        updateStudentReq,
        getDisplayName,
        getFirstName
    }
}

