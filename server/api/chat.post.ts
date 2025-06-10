import OpenAI from 'openai'
import { defineEventHandler, readBody, createError, setHeader, sendStream, getRequestHeaders, getRequestURL } from 'h3'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message, userId, userRole, conversationHistory = [] } = body

    if (!message || typeof message !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message is required',
      })
    }

    if (!userId || !userRole) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User authentication required',
      })
    }

    // Get user context from GraphQL
    const userContext = await getUserContext(userId, userRole, event)
    
    // Build system prompt with user context
    const systemPrompt = buildAcademicAssistantPrompt(userContext)
    
    // Prepare conversation history with proper OpenAI types
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ]
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      // Add previous conversation messages
      conversationHistory.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content })
        }
      })
    }
    
    // Add the current user message
    messages.push({ role: 'user', content: message })

    // Set headers for Server-Sent Events
    setHeader(event, 'content-type', 'text/event-stream')
    setHeader(event, 'cache-control', 'no-cache')
    setHeader(event, 'connection', 'keep-alive')
    setHeader(event, 'access-control-allow-origin', '*')
    setHeader(event, 'access-control-allow-headers', 'Cache-Control')

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const openaiStream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1000,
          })

          for await (const chunk of openaiStream) {
            const content = chunk.choices[0]?.delta?.content || ''
            
            if (content) {
              const data = JSON.stringify({
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                role: 'assistant',
                content: content,
                timestamp: new Date().toISOString(),
                isPartial: true,
              })

              controller.enqueue(`data: ${data}\n\n`)
            }
          }

          // Send end signal
          controller.enqueue('data: [DONE]\n\n')
          controller.close()
        } catch (error) {
          console.error('OpenAI Streaming Error:', error)
          const errorData = JSON.stringify({
            error: 'Failed to process chat message',
            message: error instanceof Error ? error.message : 'Unknown error',
          })
          controller.enqueue(`data: ${errorData}\n\n`)
          controller.close()
        }
      },
    })

    return sendStream(event, stream)
  } catch (error) {
    console.error('Chat API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})

// Get user context from GraphQL using the established authentication flow
async function getUserContext(userId: string, userRole: 'student' | 'staff', event: any) {
  try {
    // Get authorization header from the request 
    const headers = getRequestHeaders(event)
    const authHeader = headers.authorization || ''
    
    console.log(`Getting context for ${userRole} with ID: ${userId}`)
    console.log(`Authorization header present: ${authHeader ? 'Yes' : 'No'}`)
    
    // Use the established GraphQL proxy endpoint which handles authentication properly
    if (userRole === 'student') {
      const response = await fetch(`${getRequestURL(event).origin}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          query: `
            query GetStudentContext($studentId: ID!) {
              student(id: $studentId) {
                id
                firstName
                lastName
                email
              }
              studentCourses(studentId: $studentId) {
                id
                name
                semester
                description
              }
              grades(studentId: $studentId) {
                id
                studentId
                courseId
                semester
                gradeType
                itemId
                gradeValue
                comments
                gradedAt
              }
            }
          `,
          variables: { studentId: userId }
        })
      })
      
      const data = await response.json()
      console.log('GraphQL response for student:', data)
      
      // Debug: Log the actual grades data structure
      if (data.data?.grades) {
        console.log('DEBUG: Grades data structure:', JSON.stringify(data.data.grades, null, 2))
      }
      
      // Check for GraphQL errors first
      if (data.errors && data.errors.length > 0) {
        console.error('GraphQL errors:', data.errors)
        
        // If it's an authentication error, return minimal context but log the issue
        if (data.errors.some((err: any) => err.message && err.message.includes('Unauthenticated') || err.message && err.message.includes('authentication'))) {
          console.log(`Authentication failed for user ${userId}, using minimal context`)
          return {
            type: 'student',
            data: {
              student: { id: userId, firstName: 'Student', lastName: '', email: '' },
              courses: [],
              grades: [],
              authError: true
            }
          }
        }
      }
      
      // If no student found with this ID, create minimal context
      if (!data.data?.student) {
        console.log(`No student found with ID ${userId}, using minimal context`)
        return {
          type: 'student',
          data: {
            student: { id: userId, firstName: 'Student', lastName: '', email: '' },
            courses: [],
            grades: []
          }
        }
      }
      
      return {
        type: 'student',
        data: {
          student: data.data?.student,
          courses: data.data?.studentCourses || [],
          grades: data.data?.grades || []
        }
      }
          } else if (userRole === 'staff') {
      const response = await fetch(`${getRequestURL(event).origin}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          query: `
            query GetStaffContext($staffId: ID!) {
              staff(id: $staffId) {
                id
                firstName
                lastName
                email
                title
                office
              }
              staffCourses(staffId: $staffId) {
                id
                name
                semester
                description
              }
            }
          `,
          variables: { staffId: userId }
        })
      })
      
      const data = await response.json()
      console.log('GraphQL response for staff:', data)
      
      // If no staff found with this ID, create minimal context
      if (!data.data?.staff) {
        console.log(`No staff found with ID ${userId}, using minimal context`)
        return {
          type: 'staff',
          data: {
            staff: { id: userId, firstName: 'Staff', lastName: '', email: '', title: 'Staff Member' },
            courses: []
          }
        }
      }
      
      return {
        type: 'staff',
        data: {
          staff: data.data?.staff,
          courses: data.data?.staffCourses || []
        }
      }
    }
    
    return { type: userRole, data: {} }
  } catch (error) {
    console.error('Error fetching user context:', error)
    return { type: userRole, data: {} }
  }
}

function buildAcademicAssistantPrompt(userContext: any): string {
  const basePrompt = `You are an AI academic assistant for the Technion Academic Portal (BetterGR). You help students and staff with academic-related questions and portal navigation.

Your core responsibilities:
- Provide helpful, accurate information about courses, assignments, grades, and academic processes
- Guide users through portal features and functionality
- Answer questions professionally and concisely
- If you don't know something specific, direct users to appropriate resources or contacts

Guidelines:
- Be friendly but professional
- Keep responses concise and organized
- Use formatting (bold, italics, bullets) to make information clear
- Always stay within your academic assistant role
- Don't make up specific information you don't have access to`

  if (userContext.type === 'student' && userContext.data.student) {
    const student = userContext.data.student
    const courses = userContext.data.courses || []
    const grades = userContext.data.grades || []
    const authError = userContext.data.authError
    
    const hasRealData = student.firstName !== 'Student' && courses.length > 0
    
    if (hasRealData) {
      // Format grades data properly for the AI
      const gradesInfo = grades.map((grade: any) => {
        return `${grade.courseId || 'Unknown Course'}: ${grade.gradeValue || 'Not graded'} (${grade.gradeType || 'Final'})${grade.comments ? ' - ' + grade.comments : ''}`
      }).join('\n')
      
      const coursesInfo = courses.map((course: any) => {
        return `${course.name} (${course.semester})`
      }).join(', ')

      return `${basePrompt}

Current User Context:
- Student: ${student.firstName} ${student.lastName}
- Email: ${student.email}
- Enrolled Courses: ${coursesInfo}

ACTUAL GRADES DATA:
${gradesInfo}

IMPORTANT: Use the ACTUAL grade values above when the user asks about their grades. Do NOT use placeholder text like "[Insert Grade Here]". Show the real grade values from the data above.`
    } else if (authError) {
      return `${basePrompt}

Current User Context:
- Authenticated student user
- Authentication issue detected with data access

I notice there might be an authentication issue preventing me from accessing your specific academic data right now. This could be due to:
1. Your user profile not being fully set up in the system yet
2. A temporary authentication token issue
3. Your account needing to be linked with academic records

For immediate access to your information, please:
1. Try refreshing your browser and logging in again
2. Visit the portal directly to check your Grades and Courses sections
3. Contact IT support if the issue persists

I can still help with general questions about courses, assignments, and using the portal features.`
    } else {
      return `${basePrompt}

Current User Context:
- Authenticated student user
- Setting up your academic profile

I can see you're logged in, but your academic profile might still be getting set up in our system. This is normal for new users or at the beginning of a semester.

For your current academic information:
1. Check the Grades section in the portal for your current grades
2. Visit the Courses section to see your enrolled courses  
3. Use the Assignments section for homework and deadlines

I'm here to help with general questions about courses, academic policies, and using the portal features. Once your profile is fully set up, I'll be able to provide more personalized assistance!`
    }
  }
  
  if (userContext.type === 'staff' && userContext.data.staff) {
    const staff = userContext.data.staff
    const courses = userContext.data.courses
    
    const hasRealData = staff.firstName !== 'Staff' && courses.length > 0
    
    if (hasRealData) {
      return `${basePrompt}

Current User Context:
- Staff: ${staff.firstName} ${staff.lastName} (${staff.title || 'Staff Member'})
- Email: ${staff.email}
- Office: ${staff.office || 'Not specified'}
- Teaching Courses: ${courses.map((c: any) => c.name).join(', ')}

You have access to this staff member's real academic data. You can provide specific information about their courses and students.`
    } else {
      return `${basePrompt}

Current User Context:
- Authenticated staff user
- Limited data access available

When users ask about specific data (courses, students, grades), direct them to:
1. Use the Courses section to manage their classes
2. Check the Staff dashboard for teaching assignments
3. Access the Grades section for student grading

Provide general guidance about using the portal features for staff.`
    }
  }
  
  return basePrompt
} 