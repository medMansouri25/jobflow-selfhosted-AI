import { getCurrentUserId } from "@/lib/current-user";
import { todayInParis } from "@/lib/dates";
import {
  countApplicationsByStatus,
  getApplicationStats,
  listRecentApplications,
} from "@/modules/applications/service";
import {
  countUpcomingInterviews,
  listUpcomingInterviews,
} from "@/modules/applications/interview-lists";
import { Dashboard } from "@/modules/dashboard/components/dashboard";
import { oldestWeekShown, rate, weeklyCounts } from "@/modules/dashboard/domain/stats";

// Données lues à chaque requête : le tableau de bord reflète l'état actuel de la base.
export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await getCurrentUserId();
  const today = todayInParis();
  const now = new Date();
  const [counts, applications, stats, upcomingInterviews, upcomingCount] = await Promise.all([
    countApplicationsByStatus(userId),
    listRecentApplications(userId, 5),
    getApplicationStats(userId, oldestWeekShown(today)),
    listUpcomingInterviews(userId, now, 5),
    countUpcomingInterviews(userId, now),
  ]);

  return (
    <Dashboard
      counts={counts}
      upcomingInterviews={upcomingInterviews}
      upcomingCount={upcomingCount}
      stats={{
        responseRate: rate(stats.responded, stats.total),
        interviewRate: rate(stats.interviewed, stats.total),
        weeks: weeklyCounts(stats.appliedDates, today),
      }}
      recent={applications.map((application) => ({
        id: application.id,
        companyName: application.company.name,
        jobTitle: application.jobTitle,
        status: application.status,
        updatedAt: application.updatedAt,
      }))}
    />
  );
}
