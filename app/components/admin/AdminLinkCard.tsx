import Link from "next/link";
import StampShell from "@/app/components/ui/StampShell";
import { STAMP_CONTROL_SHADOW, STAMP_FACE } from "@/app/lib/stamp";
import { twMerge } from "tailwind-merge";

export interface AdminLinkItem {
  href: string;
  icon: string;
  label: string;
  description: string;
}

export default function AdminLinkCard({ href, icon, label, description }: AdminLinkItem) {
  return (
    <Link href={href} className="group block">
      <StampShell
        variant="card"
        interactive
        bleed={false}
        faceClassName="p-5 group-hover:border-hot"
      >
        <div className="flex items-center gap-4">
          <span
            className={twMerge(
              STAMP_FACE,
              STAMP_CONTROL_SHADOW,
              "inline-flex h-9 w-9 shrink-0 items-center justify-center bg-surface text-ink transition-colors group-hover:border-hot group-hover:text-hot",
            )}
            aria-hidden="true"
          >
            <i className={`fa-solid ${icon} text-[13px]`} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="caption-mono text-ink">{label}</div>
            <p className="mt-1 text-[13px] leading-snug text-ink-faint">{description}</p>
          </div>
          <i
            className="fa-solid fa-chevron-right shrink-0 text-xs text-rule transition-colors group-hover:text-ink-muted"
            aria-hidden="true"
          />
        </div>
      </StampShell>
    </Link>
  );
}
