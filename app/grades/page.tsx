'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, fetchWithAuth, getUserId } from '@/lib/auth';
import { CourseGrades } from '@/components/grades/course-grades';

interface ExamGrade {
  course: string;
  exam_type: string;
  grade: string;
}

interface HomeworkGrade {
  course: string;
  homework_number: string;
  grade: string;
}

interface StudentCourseGrades {
  course_id: string;
  exams: ExamGrade[];
  homeworks: HomeworkGrade[];
}

interface GradesResponse {
  student_id: string;
  courses: StudentCourseGrades[];
}

export default function GradesPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  const [grades, setGrades] = useState<StudentCourseGrades[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, redirecting to login...');
      router.push('/login');
      return;
    }

    const fetchGrades = async () => {
      try {
        const userId = getUserId();
        console.log('Fetching grades for user:', userId);
        if (!userId) {
          throw new Error('Student ID not found');
        }
        
        const url = `${API_URL}/api/grades/${userId}`;
        console.log('Making request to:', url);    
        const response = await fetchWithAuth(url);
        if (!response.ok) {
          throw new Error('Failed to fetch grades');
        }
        const data = await response.json();
        console.log('Received grades:', data);
        setGrades(data?.courses || []);
      } catch (err) {
        console.error('Error fetching grades:', err);
        setError('Failed to load grades. Please try again later.');
        setGrades([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, [API_URL, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading grades...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Grades</h1>
      <div className="space-y-6">
        {Array.isArray(grades) && grades.map((course) => (
          <CourseGrades key={course.course_id} course={course} />
        ))}
        {(!grades || grades.length === 0) && (
          <div className="text-center text-muted-foreground">
            No grades available.
          </div>
        )}
      </div>
    </div>
  );
} 