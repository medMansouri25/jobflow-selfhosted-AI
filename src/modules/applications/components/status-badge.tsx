import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/modules/applications/domain/application";
import { STATUS_LABELS } from "@/modules/applications/labels";

// Couleurs de la maquette, définies dans globals.css (--status-*-bg / --status-*-fg).
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  DRAFT: "bg-status-draft-bg text-status-draft-fg",
  APPLIED: "bg-status-applied-bg text-status-applied-fg",
  INTERVIEW: "bg-status-interview-bg text-status-interview-fg",
  ACCEPTED: "bg-status-accepted-bg text-status-accepted-fg",
  REJECTED: "bg-status-rejected-bg text-status-rejected-fg",
  ARCHIVED: "bg-status-archived-bg text-status-archived-fg",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
