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
    { label: "SEATTLE", center: 0.35 },
    { label: "LILLE", center: 0.85 },
] as const;

const [EMAIL_USER, EMAIL_DOMAIN] = SITE.email.split("@");

const PANO_SOURCES = [
    "/contact-panos/sea-lil-1.webp",
    "/contact-panos/sea-lil-4.webp",
] as const;

const PANO_MARKERS = LOCATIONS.map((loc) => ({
    t: loc.center,
    label: loc.label,
}));

const PANO_HEIGHT_CLASS = "h-32";

const MARKER_HOLD_MS = 2000;
const MARKER_FADE_MS = 300;

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
            shape="square"
            inverted
        />
    );
}

export default function ContactSlab({ className = "" }: ContactSlabProps) {
    const panoRef = useRef<ScrollingPanoHandle>(null);
    const markerTimersRef = useRef<number[]>([]);
    const [markerOpacities, setMarkerOpacities] = useState<Record<string, number>>(
        {},
    );

    useEffect(() => {
        return () => {
            markerTimersRef.current.forEach((id) => window.clearTimeout(id));
        };
    }, []);

    const clearMarkerTimers = () => {
        markerTimersRef.current.forEach((id) => window.clearTimeout(id));
        markerTimersRef.current = [];
    };

    const allMarkerLabels = LOCATIONS.map((loc) => loc.label);

    const revealMarkers = () => {
        clearMarkerTimers();
        const hidden = Object.fromEntries(allMarkerLabels.map((label) => [label, 0]));
        setMarkerOpacities(hidden);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setMarkerOpacities(Object.fromEntries(allMarkerLabels.map((label) => [label, 1])));
            });
        });

        const fadeOutId = window.setTimeout(() => {
            setMarkerOpacities(Object.fromEntries(allMarkerLabels.map((label) => [label, 0])));
        }, MARKER_HOLD_MS);

        const clearId = window.setTimeout(() => {
            setMarkerOpacities({});
        }, MARKER_HOLD_MS + MARKER_FADE_MS);

        markerTimersRef.current = [fadeOutId, clearId];
    };

    const handleLocationClick = (loc: (typeof LOCATIONS)[number]) => {
        const started = panoRef.current?.seekToCenter(loc.center);
        if (!started) return;
        revealMarkers();
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
                    markers={PANO_MARKERS}
                    markerOpacities={markerOpacities}
                />
            </div>

            {/* Bottom strip with controls and location pills */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-5">
                <IconCircleButton
                    href={SITE.social.linkedin}
                    icon="fa-linkedin"
                    iconFamily="fa-brands"
                    title="LinkedIn"
                    size="xs"
                    shape="square"
                    inverted
                />
                <IconCircleButton
                    href={SITE.social.github}
                    icon="fa-github"
                    iconFamily="fa-brands"
                    title="GitHub"
                    size="xs"
                    shape="square"
                    inverted
                />
                <IconCircleButton
                    href={SITE.social.scholar}
                    icon="fa-graduation-cap"
                    title="Google Scholar"
                    size="xs"
                    shape="square"
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
