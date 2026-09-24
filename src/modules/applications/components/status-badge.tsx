import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/modules/applications/domain/application";
import { STATUS_LABELS } from "@/modules/applications/labels";

// Couleurs définies dans globals.css (--status-*), claires et sombres.
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  DRAFT: "bg-status-draft/12 text-status-draft ring-status-draft/25",
  APPLIED: "bg-status-applied/12 text-status-applied ring-status-applied/25",
  INTERVIEW:
    "bg-status-interview/12 text-status-interview ring-status-interview/25",
  ACCEPTED: "bg-status-accepted/12 text-status-accepted ring-status-accepted/25",
  REJECTED: "bg-status-rejected/12 text-status-rejected ring-status-rejected/25",
  ARCHIVED: "bg-status-archived/12 text-status-archived ring-status-archived/25",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
