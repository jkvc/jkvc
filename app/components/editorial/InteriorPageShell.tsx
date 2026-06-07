import { twMerge } from "tailwind-merge";

interface InteriorPageShellProps {
    children: React.ReactNode;
    /** Tailwind max-width preset. Default `max-w-3xl`. */
    maxWidthClassName?: string;
    className?: string;
}

export default function InteriorPageShell({
    children,
    maxWidthClassName = "max-w-3xl",
    className,
}: InteriorPageShellProps) {
    return (
        <div
            className={twMerge(
                "min-h-screen px-5 pb-16 pt-8 text-ink sm:px-8",
                className,
            )}
        >
            <div className={twMerge("mx-auto w-full", maxWidthClassName)}>
                {children}
            </div>
        </div>
    );
}
