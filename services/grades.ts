import { fetchWithAuth } from '@/lib/auth';
import { getUserId } from '@/lib/auth';

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
  getCourseGrades: async () => {
    const studentId = getUserId();
    return fetchWithAuth(`/grades/${studentId}`);
  },

  getStudentCourseGrades: (courseId: string) =>{
    const studentId = getUserId();
    return fetchWithAuth(`/grades/${studentId}/${courseId}`);
  },
};