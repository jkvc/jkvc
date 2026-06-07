"use client";

import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import ScrollingPano, {
    type ScrollingPanoHandle,
} from "@/app/components/ui/ScrollingPano";
import { STAMP_CARD_SHADOW, STAMP_FACE } from "@/app/lib/stamp";
import { SITE } from "@/app/lib/site";

interface ContactSlabProps {
    className?: string;
}

const LOCATIONS = [
    {
        label: "SEATTLE",
        center: 0.25,
        blurb: "Seattle: tech hub in the pacific northwest; beautiful mountains, rains a lot",
    },
    {
        label: "LILLE",
        center: 0.75,
        blurb: "Lille: college town in the French Flandres, bordering Belgium; also rains a lot",
    },
] as const;

const TOAST_DURATION_MS = 5000;

const [EMAIL_USER, EMAIL_DOMAIN] = SITE.email.split("@");

const PANO_SOURCES = [
    "/contact-panos/sea-lil-1.webp",
    "/contact-panos/sea-lil-4.webp",
] as const;

const PANO_HEIGHT_CLASS = "h-40";

function EmailAction() {
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (!revealed) return;
        const timer = setTimeout(() => setRevealed(false), 3000);
        return () => clearTimeout(timer);
    }, [revealed]);

    if (revealed) {
        return (
            <a
                href={`mailto:${EMAIL_USER}@${EMAIL_DOMAIN}`}
                className="flex items-center gap-1.5 px-3 h-7 border-2 border-hot text-hot bg-surface text-[11px] font-mono font-bold uppercase tracking-wider"
            >
                <span>{EMAIL_USER}</span>
                <i className="fa-brands fa-google text-[11px]" />
            </a>
        );
    }

    return (
        <IconCircleButton
            onClick={() => setRevealed(true)}
            icon="fa-envelope"
            title="Reveal email"
            size="xs"
            inverted
        />
    );
}

export default function ContactSlab({ className = "" }: ContactSlabProps) {
    const panoRef = useRef<ScrollingPanoHandle>(null);
    const toastIdRef = useRef(0);
    const [toast, setToast] = useState<{
        id: number;
        message: string;
    } | null>(null);
    const toastTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current !== null) {
                window.clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    const handleLocationClick = (loc: (typeof LOCATIONS)[number]) => {
        const started = panoRef.current?.seekToCenter(loc.center);
        if (!started) return;
        if (toastTimerRef.current !== null) {
            window.clearTimeout(toastTimerRef.current);
        }
        toastIdRef.current += 1;
        setToast({ id: toastIdRef.current, message: loc.blurb });
        toastTimerRef.current = window.setTimeout(() => {
            setToast(null);
            toastTimerRef.current = null;
        }, TOAST_DURATION_MS);
    };

    return (
        <div
            className={twMerge(
                STAMP_FACE,
                STAMP_CARD_SHADOW,
                "relative overflow-hidden bg-ink text-surface",
                className,
            )}
        >
            {/* Panorama band */}
            <div className={`relative w-full ${PANO_HEIGHT_CLASS}`}>
                <ScrollingPano
                    ref={panoRef}
                    src={PANO_SOURCES}
                    duration={60}
                    direction="rtl"
                />
            </div>

            {/* Toast */}
            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    aria-live="polite"
                    className="absolute top-4 left-1/2 -translate-x-1/2 px-4 h-7 bg-ink border-2 border-surface/30 text-surface text-[12px] flex items-center whitespace-nowrap max-w-[calc(100%-2rem)] pointer-events-none"
                    style={{ animation: "contact-toast-fade 5s ease-in-out forwards" }}
                >
                    {toast.message}
                </div>
            )}

            {/* Bottom strip with controls and location pills */}
            <div className="flex items-center gap-3 flex-wrap px-5 pt-2 pb-4">
                <IconCircleButton
                    href={SITE.social.linkedin}
                    icon="fa-linkedin"
                    iconFamily="fa-brands"
                    title="LinkedIn"
                    size="xs"
                    inverted
                />
                <IconCircleButton
                    href={SITE.social.github}
                    icon="fa-github"
                    iconFamily="fa-brands"
                    title="GitHub"
                    size="xs"
                    inverted
                />
                <IconCircleButton
                    href={SITE.social.scholar}
                    icon="fa-graduation-cap"
                    title="Google Scholar"
                    size="xs"
                    inverted
                />
                <EmailAction />

                <div className="ml-auto flex items-center gap-2 caption-mono text-surface/60">
                    <i className="fa-solid fa-bed text-[10px]" aria-hidden="true" />
                    {LOCATIONS.map((loc, i) => (
                        <span key={loc.label} className="flex items-center gap-2">
                            {i > 0 && <span className="text-surface/40">&</span>}
                            <button
                                type="button"
                                onClick={() => handleLocationClick(loc)}
                                className="caption-mono underline underline-offset-4 decoration-surface/30 hover:decoration-surface/70 hover:text-surface transition-colors cursor-pointer"
                            >
                                {loc.label}
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
