import { getCurrentUserId } from "@/lib/current-user";
import {
  countApplicationsByStatus,
  listApplications,
} from "@/modules/applications/service";
import { Dashboard } from "@/modules/dashboard/components/dashboard";

// Données lues à chaque requête : le tableau de bord reflète l'état actuel de la base.
export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await getCurrentUserId();
  const [counts, applications] = await Promise.all([
    countApplicationsByStatus(userId),
    listApplications(userId),
  ]);

  return (
    <Dashboard
      counts={counts}
      recent={applications.slice(0, 5).map((application) => ({
        id: application.id,
        companyName: application.company.name,
        jobTitle: application.jobTitle,
        status: application.status,
        updatedAt: application.updatedAt,
      }))}
    />
  );
}
