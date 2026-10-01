import { getCurrentUserId } from "@/lib/current-user";
import { todayInParis } from "@/lib/dates";
import {
  countApplicationsByStatus,
  getApplicationStats,
  listRecentApplications,
} from "@/modules/applications/service";
import { Dashboard } from "@/modules/dashboard/components/dashboard";
import { oldestWeekShown, rate, weeklyCounts } from "@/modules/dashboard/domain/stats";

// Données lues à chaque requête : le tableau de bord reflète l'état actuel de la base.
export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await getCurrentUserId();
  const today = todayInParis();
  const [counts, applications, stats] = await Promise.all([
    countApplicationsByStatus(userId),
    listRecentApplications(userId, 5),
    getApplicationStats(userId, oldestWeekShown(today)),
  ]);

  return (
    <Dashboard
      counts={counts}
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
