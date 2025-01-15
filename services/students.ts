import { fetchWithAuth } from '@/lib/api-client';

export interface Student {
  id: string;
  enrolled_courses: Course[];
}

interface Course {
  id: string;
  grade: number;
}

export const studentService = {
  getStudentCourses: (id: string) => 
    fetchWithAuth(`/students/${id}`),
};