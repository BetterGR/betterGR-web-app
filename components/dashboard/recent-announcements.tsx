"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { courseService } from '@/services/courses';
import { studentService } from '@/services/students';

interface Announcement {
  id: string;
  course: string;
  message: string;
  date: string;
}

export function RecentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        // Assuming we get the student ID from auth context
        const studentId = "current-user-id";
        const courses = await studentService.getStudentCourses(studentId);
        
        // Fetch announcements for each course
        const announcementsPromises = courses.map(course => 
          courseService.getCourseAnnouncements(course.id)
        );
        
        const allAnnouncements = await Promise.all(announcementsPromises);
        const flatAnnouncements = allAnnouncements.flat();
        
        // Sort by date
        const sortedAnnouncements = flatAnnouncements.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setAnnouncements(sortedAnnouncements);
      } catch (error) {
        console.error('Failed to load announcements:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, []);

  if (loading) {
    return <div>Loading announcements...</div>;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{announcement.course}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(announcement.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-2 text-sm">{announcement.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}