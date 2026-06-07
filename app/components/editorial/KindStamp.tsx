import { twMerge } from "tailwind-merge";

/** Masonry / interior page eyebrow — mono hot label on surface-2 chip. */
export const KIND_STAMP_CLASS =
    "inline-flex items-center gap-1 border border-ink bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-hot";

interface KindStampProps {
    label: string;
    icon?: string;
    className?: string;
}

export default function KindStamp({ label, icon, className }: KindStampProps) {
    return (
        <span className={twMerge(KIND_STAMP_CLASS, className)}>
            {icon && (
                <i className={`fa-solid ${icon} text-[8px]`} aria-hidden="true" />
            )}
            {label}
        </span>
    );
}
