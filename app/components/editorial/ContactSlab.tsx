"use client";

import { useEffect, useRef, useState } from "react";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import ScrollingPano, {
    type ScrollingPanoHandle,
} from "@/app/components/ui/ScrollingPano";
import { SITE } from "@/app/lib/site";

interface ContactSlabProps {
    className?: string;
}

/**
 * Place names rendered in the bottom strip, paired with the image-x position
 * each prompt was concentrated at during pano generation. Clicking a label
 * seeks the panorama so that prompt's region centers in the viewport, and
 * surfaces the matching `blurb` as a 5-second toast at the top of the slab.
 *
 * SITE.location ("SEATTLE & LILLE") is left as the canonical string for the
 * OG card; this structured pair is the source of truth for the slab UI.
 */
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

/** Total visible duration of the click-toast (matches the keyframe in CSS). */
const TOAST_DURATION_MS = 5000;

const [EMAIL_USER, EMAIL_DOMAIN] = SITE.email.split("@");

/** Panorama assets used as the slab's top band. They wrap horizontally so the
 *  scroll loop is seamless. One is selected at random per page load. */
const PANO_SOURCES = [
    "/contact-panos/sea-lil-1.webp",
    "/contact-panos/sea-lil-4.webp",
] as const;

/** Height of the panorama band — preserved from the previous overlay design. */
const PANO_HEIGHT_CLASS = "h-40"; // 160px

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
                className="flex items-center gap-1.5 px-3 h-7 rounded-full border border-hot/60 text-hot text-[11px] font-mono"
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

/**
 * Two-band inverted contact slab:
 *
 *   [ scrolling panorama band              ]
 *   [ buttons …                  loc pills ]
 *
 * The bottom band is a solid `bg-ink` strip; both bands sit inside one
 * rounded-2xl clip so the corners stay continuous. Clicking a location label
 * smoothly seeks the panorama to that prompt-region's center.
 */
export default function ContactSlab({ className = "" }: ContactSlabProps) {
    const panoRef = useRef<ScrollingPanoHandle>(null);
    // Each toast carries a unique `id` so re-clicking the same location
    // restarts the CSS animation (React reuses the DOM node across renders;
    // a fresh key on the toast forces a remount → animation replays). The
    // counter ref is used instead of Date.now so the React Compiler purity
    // lint doesn't flag the click handler.
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
        // Only flash a toast when actual movement begins — clicks ignored
        // because a seek is already in flight produce no toast.
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
            className={`relative overflow-hidden rounded-2xl bg-ink text-surface ${className}`}
        >
            {/* Top band: panorama only. Its own relative wrapper anchors the
          ScrollingPano (which positions itself absolute inset-0). A short
          ink-tinted gradient at the bottom edge softens the seam between the
          pano and the opaque strip below — the hard horizontal boundary read
          as a band cut, this melts it into a haze. */}
            <div className={`relative w-full ${PANO_HEIGHT_CLASS}`}>
                <ScrollingPano
                    ref={panoRef}
                    src={PANO_SOURCES}
                    duration={60}
                    direction="rtl"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-b from-transparent to-ink pointer-events-none"
                />
            </div>

            {/* Click-toast: pill near the top of the slab, dark background so
                it stays legible over the panorama. `key` keys the animation
                to the toast id, so a fresh click restarts the fade in/out. */}
            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    aria-live="polite"
                    className="absolute top-4 left-1/2 -translate-x-1/2 px-4 h-7 rounded-full bg-ink/90 border border-surface/15 text-surface/90 text-[12px] flex items-center whitespace-nowrap max-w-[calc(100%-2rem)] pointer-events-none"
                    style={{
                        animation: "contact-toast-fade 5s ease-in-out forwards",
                    }}
                >
                    {toast.message}
                </div>
            )}

            {/* Bottom band: opaque ink strip with controls and location pills. */}
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

                {/* Location: caption-mono text with a leading icon. Each place
            name is a real button that seeks the panorama so its associated
            prompt-region centers in the viewport. Hover state stays live
            even mid-seek (clicks are silently ignored while a seek is in
            flight — see ScrollingPano). */}
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
