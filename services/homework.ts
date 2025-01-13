import { fetchWithAuth } from '@/lib/api-client';

export interface Homework {
  id: string;
  title: string;
  description: string;
  workflow: string;
  course_id: string;
  due_date: string;
  submissions: HomeworkSubmission[];
}

export interface HomeworkSubmission {
  student_id: string;
  submission_files: string;
  submission_time: string;
  grade: number;
  feedback: string;
}

export const homeworkService = {
  getCourseHomework: (courseId: string) => 
    fetchWithAuth(`/courses/${courseId}/homework`),

  getHomeworkSubmissions: (courseId: string, homeworkId: string) => 
    fetchWithAuth(`/courses/${courseId}/homework/${homeworkId}/submissions`),

  submitHomework: (courseId: string, homeworkId: string, data: FormData) => 
    fetchWithAuth(`/courses/${courseId}/homeworks/${homeworkId}/submissions`, {
      method: 'POST',
      body: data,
    }),
};