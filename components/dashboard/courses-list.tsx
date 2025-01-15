"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, fetchWithAuth, getUserId } from '@/lib/auth';
import { studentService } from "@/services/students";

export function CoursesList() {
  const [courses, setCourses] = useState<{ id: string; name: string; description?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, redirecting to login...');
      router.push('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await studentService.getStudentCourses();
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        console.log('Received courses:', data);
        setCourses(data || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [API_URL, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading courses...</div>
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
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Your Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {courses.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No courses available
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{course.name} - {course.id}</p>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
