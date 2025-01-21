import { fetchWithAuth, getUserId } from '@/lib/auth';

export interface Student {
  id: string;
  enrolled_courses: Course_title[];
}
  
export interface Course_title {
  id: string;
  grade: number;
}

export const studentService = {
  getStudentCourses: async () => {
    return fetchWithAuth(`/students/${getUserId()}/courses`);
  },
};
