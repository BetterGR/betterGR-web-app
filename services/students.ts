import { fetchWithAuth } from '@/lib/api-client';

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolled_courses: string[];
}

export const studentService = {
  getStudent: (id: string) => 
    fetchWithAuth(`/students/${id}`),
  
  getStudentCourses: (id: string) => 
    fetchWithAuth(`/students/${id}/courses`),
  
  getStudentGrades: (id: string) => 
    fetchWithAuth(`/students/${id}/courses/grades`),
};