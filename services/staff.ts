import { fetchWithAuth, getUserId } from '@/lib/auth';

export interface Staff {
  id: string;
  name: string;
  email: string;
  title: string;
  assigned_courses: string[];
  office: string;
}

export const staffService = {
  getStaff: () => 
    fetchWithAuth(`/staff/${getUserId()}`),
  
  getStaffCourses: () => 
    fetchWithAuth(`/staff/${getUserId()}/courses`),
};