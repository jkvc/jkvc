import Link from "next/link";
import Wordmark from "@/app/components/brand/Wordmark";
import ContactSlab from "@/app/components/editorial/ContactSlab";
import RecipeHeader from "@/app/components/editorial/RecipeHeader";
import { SITE } from "@/app/lib/site";
import { renderInlineMarkdown } from "@/app/lib/inline-markdown";

interface TimelineEntry {
    /** Pre-formatted date span, e.g. "Jul 2025 – Present". Rendered uppercased
     *  in the mono eyebrow row. */
    dateRange: string;
    organization: string;
    role: string;
    /** Single-sentence description; the only prose per row in the compact
     *  recruiter timeline. Keep terse — if it grows past two lines it's
     *  better content for /resume. */
    /** Highlights the entry with a pulsing red dot on the rail. At most one. */
    current?: boolean;
}

const EXPERIENCE: TimelineEntry[] = [
    {
        dateRange: "Jul 2025 – Present",
        organization: "Meta Superintelligence Lab",
        role: "LLM harness and new AI experiences",
        current: true,
    },
    {
        dateRange: "Oct 2023 – Jun 2025",
        organization: "Meta Gen AI",
        role: "Diffusion models",
    },
    {
        dateRange: "Oct 2021 – Sep 2023",
        organization: "Meta Computational Photography",
        role: "Computer Vision",
    },
    {
        dateRange: "2018 – 2020",
        organization: "Stanford University",
        role: "Master's in AI/ML",
    },
    {
        dateRange: "2014 – 2018",
        organization: "UC San Diego",
        role: "B.S. Computer Science",
    },
];

/** Section masthead — title + flippant subhead. Keeps the editorial voice
 *  consistent across the three /about sections without hand-rolling at each
 *  call site. */
function SectionHead({
    title,
    subhead,
}: {
    title: string;
    subhead?: string;
}) {
    return (
        <header className="mb-6">
            <h2 className="font-serif text-3xl leading-tight text-ink">{title}</h2>
            {subhead && (
                <p className="mt-1 font-serif italic text-[15px] leading-snug text-ink-muted">
                    {subhead}
                </p>
            )}
        </header>
    );
}

/** Vertical offset (px) of the dot's center from the top of each row's
 *  content column. Tuned to sit on the visual centerline of the
 *  `caption-mono` eyebrow that opens every row, so dots line up with
 *  their date label. Used by both the dot itself and the rail segment
 *  endpoints — change one, change the other. */
const DOT_CENTER_PX = 8;

function TimelineRow({
    entry,
    isFirst,
    isLast,
}: {
    entry: TimelineEntry;
    isFirst: boolean;
    isLast: boolean;
}) {
    // Rail is rendered per-row so the first row's segment can start at the
    // dot center (instead of the top of the row) and the last row's segment
    // can end at the dot center. A single rail on the <ol> would always
    // overshoot at both ends.
    const railStyle: React.CSSProperties =
        isFirst && isLast
            ? { display: "none" }
            : isFirst
                ? { top: `${DOT_CENTER_PX}px`, bottom: 0 }
                : isLast
                    ? { top: 0, height: `${DOT_CENTER_PX}px` }
                    : { top: 0, bottom: 0 };

    return (
        <li className="flex">
            {/* Rail + dot column. Width controls the gap between rail and the
          content column (and thus the visual indentation of the timeline). */}
            <div className="relative w-6 flex-shrink-0">
                <span
                    className="absolute left-1/2 -translate-x-1/2 w-px bg-rule"
                    style={railStyle}
                    aria-hidden
                />
                <span
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-2.5 w-2.5 items-center justify-center"
                    style={{ top: `${DOT_CENTER_PX}px` }}
                    aria-hidden
                >
                    {entry.current ? (
                        <>
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hot opacity-60" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-hot" />
                        </>
                    ) : (
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink-faint" />
                    )}
                </span>
            </div>

            {/* Content column. `pb-6` on every row except the last creates the
          inter-row spacing while keeping the rail unbroken between dots. */}
            <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-6"}`}>
                <div className="caption-mono text-ink-faint">
                    <span>{entry.dateRange.toUpperCase()}</span>
                    <span className="mx-2 text-ink-faint/50">·</span>
                    <span>{entry.role.toUpperCase()}</span>
                </div>
                <h3 className="mt-1 font-serif italic text-xl leading-tight text-ink">
                    {entry.organization}
                </h3>
            </div>
        </li>
    );
}

export default function About() {
    return (
        <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
            <div className="max-w-2xl mx-auto">
                <RecipeHeader meta={{ issue: "ABOUT" }} />

                {/* Hero — name on the left, headshot on the right as a circular
            crop. The wordmark stays pinned to its expanded form (canonical
            full name); no hover interaction here. The photo is cropped via
            `object-cover` inside a `rounded-full` square so the source
            aspect ratio doesn't matter. */}
                <section className="mt-6 mb-14 flex items-center gap-6 sm:gap-8">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-4xl sm:text-5xl text-ink leading-[1.05]">
                            <Wordmark defaultExpanded interactive={false} />
                        </h1>
                        {/* Subtitle mirrors the home tagline so `/` and `/about` read
                as one continuous statement. */}
                        <p className="mt-5 text-sm leading-relaxed text-ink-muted">
                            {renderInlineMarkdown(SITE.tagline)}
                        </p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element -- single static portrait, no transformations needed */}
                    <img
                        src="/head.jpeg"
                        alt="Portrait of Junshen Kevin Chen"
                        className="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 rounded-full object-cover border border-rule"
                    />
                </section>

                {/* Mini soliloquy — placeholder copy. Replace the lorem block with
            real prose when the voice is ready. */}
                <section className="mb-14">
                    <SectionHead title="Hi" />
                    <p className="text-[15px] leading-relaxed text-ink-muted">
                        I'm generally interested in building AI things.
                    </p>
                    <p className="text-[15px] leading-relaxed mt-3 text-ink-muted">
                        Over time I've found myself having worked on every part of the stack in an AI system, from training the model, to optimization, to inference algorithms, to large scale inference systems, to model orchestration, to the apps and the user interaction itself.
                    </p>
                    <p className="text-[15px] leading-relaxed mt-3 text-ink-muted">
                        This website is for experimenting, ranting, memeing. Like all things I've built, it's built with AI, for humans.
                    </p>
                </section>

                {/* Experience — compact recruiter timeline. The rail is drawn
            per-row so it can clip cleanly to the first and last dots
            instead of overshooting the list bounds. */}
                <section className="mb-14">
                    <SectionHead
                        title="Experience"
                        subhead="This is probably what you were looking for."
                    />
                    <ol>
                        {EXPERIENCE.map((entry, i) => (
                            <TimelineRow
                                key={i}
                                entry={entry}
                                isFirst={i === 0}
                                isLast={i === EXPERIENCE.length - 1}
                            />
                        ))}
                    </ol>
                </section>

                {/* Resume — pointer to the printable single-sheet at /resume. The
            link uses the same red+underline accent as MDX post links so
            outbound CTAs read consistently across the site. */}
                <section className="mb-16">
                    <SectionHead
                        title="Resume"
                        subhead="The most boring version possible."
                    />
                    <p className="text-[15px] leading-relaxed text-ink-muted">
                        <Link
                            href="/resume"
                            className="text-hot underline decoration-hot/40 underline-offset-[3px] hover:decoration-hot inline-flex items-center gap-1.5"
                        >
                            <span>here you go</span>
                            <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden />
                        </Link>
                    </p>
                </section>

                <ContactSlab />
            </div>
        </div>
    );
}
