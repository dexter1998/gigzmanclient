type Tone = "neutral" | "success" | "warn" | "danger" | "info" | "accent";

interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}

const TONES: Record<Tone, string> = {
  neutral: "bg-status-neutral-soft text-status-neutral",
  success: "bg-status-success-soft text-status-success",
  warn: "bg-status-warn-soft text-status-warn",
  danger: "bg-status-danger-soft text-status-danger",
  info: "bg-status-info-soft text-status-info",
  accent: "bg-accent-soft text-accent",
};

export default function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Shared mapping so a status renders identically on the site and in the dashboard. */
export function statusTone(status: string): Tone {
  switch (status) {
    case "converted":
    case "published":
    case "active":
    case "qualified":
      return "success";
    case "new":
    case "approved":
    case "connected":
      return "info";
    case "contact_attempted":
    case "consultation_scheduled":
    case "review_required":
    case "ca_review_required":
    case "testing":
    case "update_required":
      return "warn";
    case "not_converted":
    case "spam":
    case "outdated":
      return "danger";
    default:
      return "neutral";
  }
}
