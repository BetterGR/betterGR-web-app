import { fetchWithAuth } from '@/lib/api-client';

export interface Staff {
  id: string;
  name: string;
  email: string;
  title: string;
  assigned_courses: string[];
  office: string;
}

export const staffService = {
  getStaff: (id: string) => 
    fetchWithAuth(`/staff/${id}`),
  
  getStaffCourses: (id: string) => 
    fetchWithAuth(`/staff/${id}/courses`),
};