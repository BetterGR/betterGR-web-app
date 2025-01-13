import { StaffDashboardMetrics } from "@/components/staff/dashboard/metrics";
import { StaffCoursesList } from "@/components/staff/dashboard/courses-list";
import { PendingSubmissions } from "@/components/staff/dashboard/pending-submissions";

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
      </div>
      <StaffDashboardMetrics />
      <div className="grid gap-6 md:grid-cols-2">
        <StaffCoursesList />
        <PendingSubmissions />
      </div>
    </div>
  );
}