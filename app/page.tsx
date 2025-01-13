import { DashboardMetrics } from '@/components/dashboard/metrics';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { CoursesList } from '@/components/dashboard/courses-list';
import { RecentAnnouncements } from '@/components/dashboard/recent-announcements';

export default function Home() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <DashboardMetrics />
      <div className="grid gap-6 md:grid-cols-2">
        <CoursesList />
        <RecentAnnouncements />
      </div>
    </div>
  );
}