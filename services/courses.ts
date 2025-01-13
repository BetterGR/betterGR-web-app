import { fetchWithAuth } from '@/lib/api-client';

export interface Course {
  id: string;
  name: string;
  description: string;
  semester: string;
  staff: string[];
  students: string[];
  homework: string[];
}

export const courseService = {
  getCourse: (id: string) => 
    fetchWithAuth(`/courses/${id}`),

  getCourseStudents: (id: string) => 
    fetchWithAuth(`/courses/${id}/students`),

  getCourseStaff: (id: string) => 
    fetchWithAuth(`/courses/${id}/staff`),

  // Announcements
  getCourseAnnouncements: (courseId: string) => 
    fetchWithAuth(`/courses/${courseId}/announcements`),

  getAnnouncement: (courseId: string, announcementId: string) => 
    fetchWithAuth(`/courses/${courseId}/announcements/${announcementId}`),

  // Course Materials
  getCourseMaterials: (courseId: string) => 
    fetchWithAuth(`/courses/${courseId}/courseMaterials`),
};