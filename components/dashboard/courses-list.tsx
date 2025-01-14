"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { gradesService } from '@/services/grades';
import type { Grade, CourseGrade } from '@/services/grades';
import { getUserId } from '@/lib/auth';

export function CoursesList() {
  const [courses, setCourses] = useState<{ id: string; name: string; description?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const userId = getUserId();
        if (!userId) {
          setError('User not authenticated');
          return;
        }
        
        const gradesData = await gradesService.getCourseGrades(userId);
        if (!gradesData || !gradesData.courses) {
          setCourses([]);
          return;
        }
        
        // Extract unique courses from grades data
        const coursesFromGrades = gradesData.courses.map((course: CourseGrade) => ({
          id: course.course_id,
          name: `Course ${course.course_id}`, // Temporary display name
          description: `Course details will be available when courses service is connected`
        }));
        setCourses(coursesFromGrades);
      } catch (error) {
        console.error('Failed to load courses:', error);
        setError('Unable to load courses at the moment');
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Your Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="flex justify-center p-4">Loading courses...</div>
          ) : error ? (
            <div className="text-center text-muted-foreground p-4">
              {error}
            </div>
          ) : courses.length === 0 ? (
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
                    <p className="font-medium">{course.name}</p>
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