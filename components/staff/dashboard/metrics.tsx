"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2, BookOpen, FileCheck } from "lucide-react";
import { staffService } from "@/services/staff";

export function StaffDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingSubmissions: 0,
  });

  useEffect(() => {
    // Fetch staff metrics
    const staffId = "current-staff-id"; // Get from auth context
    staffService.getStaffCourses(staffId).then((courses) => {
      setMetrics({
        totalStudents: courses.reduce((acc, course) => acc + course.students.length, 0),
        activeCourses: courses.length,
        pendingSubmissions: 0, // Calculate from homework submissions
      });
    });
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalStudents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeCourses}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pendingSubmissions}</div>
        </CardContent>
      </Card>
    </div>
  );
}