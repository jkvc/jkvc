import Link from "next/link";
import Wordmark from "@/app/components/brand/Wordmark";
import ContactSlab from "@/app/components/editorial/ContactSlab";
import InteriorPageShell from "@/app/components/editorial/InteriorPageShell";
import PageStampHeader from "@/app/components/editorial/PageStampHeader";
import StampShell from "@/app/components/ui/StampShell";
import { SITE } from "@/app/lib/site";
import { renderInlineMarkdown } from "@/app/lib/inline-markdown";

interface TimelineEntry {
    dateRange: string;
    organization: string;
    role: string;
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

function SectionHead({
    title,
    subhead,
}: {
    title: string;
    subhead?: string;
}) {
    return (
        <header className="mb-6">
            <h2 className="font-sans font-black text-2xl leading-tight text-ink uppercase tracking-tight">
                <span className="text-hot mr-2">#</span>
                {title}
            </h2>
            {subhead && (
                <p className="mt-1 text-[14px] leading-snug text-ink-muted">
                    {subhead}
                </p>
            )}
        </header>
    );
}

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
            <div className="relative w-6 flex-shrink-0">
                <span
                    className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-rule"
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
                            <span className="absolute inline-flex h-full w-full animate-ping bg-hot opacity-60" />
                            <span className="relative inline-flex h-2.5 w-2.5 bg-hot" />
                        </>
                    ) : (
                        <span className="relative inline-flex h-1.5 w-1.5 bg-ink-faint" />
                    )}
                </span>
            </div>

            <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-6"}`}>
                <div className="caption-mono text-ink-faint">
                    <span>{entry.dateRange.toUpperCase()}</span>
                    <span className="mx-2 text-ink-faint/50">·</span>
                    <span>{entry.role.toUpperCase()}</span>
                </div>
                <h3 className="mt-1 font-sans font-bold text-lg leading-tight text-ink">
                    {entry.organization}
                </h3>
            </div>
        </li>
    );
}

export default function About() {
    return (
        <InteriorPageShell>
                <PageStampHeader meta={{ eyebrow: "ABOUT" }}>
                    <div className="flex items-center gap-6 sm:gap-8">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-4xl leading-none text-ink sm:text-5xl">
                                <Wordmark defaultExpanded interactive={false} />
                            </h1>
                            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                                {renderInlineMarkdown(SITE.tagline)}
                            </p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/head.jpeg"
                            alt="Portrait of Junshen Kevin Chen"
                            className="h-24 w-24 flex-shrink-0 border-2 border-ink object-cover sm:h-32 sm:w-32"
                        />
                    </div>
                </PageStampHeader>

                {/* Bio section */}
                <section className="mb-14 mt-12">
                    <SectionHead title="Hi" />
                    <p className="text-[15px] leading-relaxed text-ink-muted">
                        I&apos;m generally interested in building AI things.
                    </p>
                    <p className="text-[15px] leading-relaxed mt-3 text-ink-muted">
                        Over time I&apos;ve found myself having worked on every part of the stack in an AI system, from training the model, to optimization, to inference algorithms, to large scale inference systems, to model orchestration, to the apps and the user interaction itself.
                    </p>
                    <p className="text-[15px] leading-relaxed mt-3 text-ink-muted">
                        This website is for experimenting, ranting, memeing. Like all things I&apos;ve built, it&apos;s built with AI, for humans.
                    </p>
                </section>

                {/* Experience */}
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

                {/* Resume */}
                <section className="mb-16">
                    <SectionHead
                        title="Resume"
                        subhead="The most boring version possible."
                    />
                    <p className="text-[15px] leading-relaxed text-ink-muted">
                        <Link href="/resume" className="group inline-flex">
                            <StampShell
                                variant="control"
                                interactive
                                inline
                                faceClassName="items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider text-ink"
                            >
                                <span>View Resume</span>
                                <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden />
                            </StampShell>
                        </Link>
                    </p>
                </section>

                <ContactSlab />
        </InteriorPageShell>
    );
}
