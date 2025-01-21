"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { courseService } from '@/services/courses';
import { studentService } from '@/services/students';
import { Announcement } from '@/services/courses';

export function RecentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const response = await courseService.getAllAnnouncements();
        const parsedAnnouncements = response.map(item => {
          try {
            const announcementData = JSON.parse(item.announcement);
            return {
              ...announcementData,
              courseId: item.course_id
            };
          } catch (e) {
            console.error('Failed to parse announcement:', e);
            return null;
          }
        }).filter((a): a is Announcement => a !== null);
        
        setAnnouncements(parsedAnnouncements);
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
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Course {announcement.courseId}</p>
                    <p className="text-sm text-muted-foreground">{announcement.title}</p>
                  </div>
                  <p className="mt-2 text-sm">{announcement.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}