import { twMerge } from "tailwind-merge";
import {
    STAMP_BLEED,
    STAMP_CARD_LIFT,
    STAMP_CARD_SHADOW,
    STAMP_CONTROL_LIFT,
    STAMP_CONTROL_SHADOW,
    STAMP_FACE,
} from "@/app/lib/stamp";

type Variant = "card" | "control";

interface StampShellProps {
    variant: Variant;
    /** Lift face on hover; shadow offset compensates so the stamp stays fixed. */
    interactive?: boolean;
    /** Isolated card shadow bleed (`p-2 -m-2`). Default true for cards. */
    bleed?: boolean;
    inline?: boolean;
    faceClassName?: string;
    className?: string;
    children: React.ReactNode;
}

export default function StampShell({
    variant,
    interactive = false,
    bleed = variant === "card",
    inline = variant === "control",
    faceClassName,
    className,
    children,
}: StampShellProps) {
    const outerDisplay = inline ? "inline-block" : "block";
    const faceDisplay = inline ? "inline-flex" : "block";
    const shadow =
        variant === "card" ? STAMP_CARD_SHADOW : STAMP_CONTROL_SHADOW;
    const lift = interactive
        ? variant === "card"
            ? STAMP_CARD_LIFT
            : STAMP_CONTROL_LIFT
        : "";

    return (
        <span
            className={twMerge(outerDisplay, bleed && STAMP_BLEED, className)}
        >
            <span
                className={twMerge(
                    STAMP_FACE,
                    shadow,
                    lift,
                    faceDisplay,
                    "bg-surface",
                    faceClassName,
                )}
            >
                {children}
            </span>
        </span>
    );
}
