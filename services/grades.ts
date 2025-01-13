import { fetchWithAuth } from '@/lib/api-client';

export interface Grade {
  student_id: string;
  semester: string;
  courses: CourseGrade[];
}

export interface CourseGrade {
  course_id: string;
  exams: ExamGrade[];
  homework: HomeworkGrade[];
}

interface ExamGrade {
  type: string;
  grade: number;
}

interface HomeworkGrade {
  hw_number: number;
  grade: number;
}

export const gradesService = {
  getCourseGrades: (courseId: string) => 
    fetchWithAuth(`/grades/${courseId}`),

  getStudentCourseGrades: (studentId: string, courseId: string) => 
    fetchWithAuth(`/grades/${studentId}/${courseId}`),
};