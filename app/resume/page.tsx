"use client";

/**
 * Printable résumé. Lives at `/resume`.
 *
 * Sized for US Letter (8.5" × 11"). On screen the page renders as a
 * letter-sized white sheet centered on a soft surface so it reads as a
 * preview. A screen-only top bar prompts the user to ⌘P to print; in
 * print, only the sheet is emitted (chrome is hidden).
 *
 * Content is intentionally tight — single sheet, no overflow. If you add
 * a row, trim somewhere else.
 */

import Wordmark from "@/app/components/brand/Wordmark";
import { SITE } from "@/app/lib/site";

/** Hostname shown on the résumé — derived from `SITE.url`. */
const WEB_ADDR = SITE.url.replace(/^https?:\/\//, "");

/** Email rendered with `[at]` so this static page is at least mildly
 *  hostile to scrapers when shared as a PDF or screenshot. The mailto
 *  link still resolves to the real address. */
const [EMAIL_USER, EMAIL_DOMAIN] = SITE.email.split("@");
const EMAIL_DISPLAY = `${EMAIL_USER}[at]${EMAIL_DOMAIN}`;

interface Role {
    /** "Jul 2025 – Present" */
    when: string;
    title: string;
    org: string;
    location?: string;
    /** Bullet lines. Keep terse — single sentence each, action-led. */
    bullets: string[];
    /** Tag string row, mono caption, optional. */
    tags?: string[];
}

const EXPERIENCE: Role[] = [
    {
        when: "Jul 2025 – Present",
        title: "Staff Machine Learning Engineer",
        org: "Meta — Meta Superintelligence Lab",
        location: "Seattle",
        bullets: [
            "Prototyping non-turn-based agents on top of turn-based LLMs — interaction & harness engineering for systems that act in the real world like a human would.",
            "Building interactive AI experiences and art installations to showcase human-AI collaboration for events such as Connect.",
        ],
        tags: ["AGENTS", "INTERACTION", "PROTOTYPING"],
    },
    {
        when: "Jul 2023 – Jun 2025",
        title: "Senior Machine Learning Engineer",
        org: "Meta — GenAI Media Foundation",
        location: "Seattle",
        bullets: [
            "Built and led the research-to-production hub system that all of Meta's media models train, eval, and ship through — enabled 5+ teams to iterate in parallel and ship 300+ model versions across 15 lines.",
            "Trained, finetuned, optimized, and developed inference algorithms for diffusion models for novel use cases (latency hiding, character consistency, attention manipulation) and shipped them at scale.",
        ],
        tags: ["DIFFUSION", "INFERENCE", "PRODUCTION"],
    },
    {
        when: "Nov 2021 – Jun 2023",
        title: "Machine Learning Engineer",
        org: "Meta — Computational Photography",
        location: "Menlo Park",
        bullets: [
            "Trained models and developed algorithms on media quality and understanding for wearables and mobile capture.",
            "Designed and collected a large-scale general-purpose egocentric dataset that became the substrate for many downstream projects.",
        ],
        tags: ["CV", "ML PIPELINES", "WEARABLES"],
    },
    {
        when: "Jun 2020 – Sep 2020",
        title: "Software Engineer Intern",
        org: "Facebook Reality Labs",
        location: "Menlo Park",
        bullets: [
            "New training objective for real-time detection & segmentation models; data-synthesis and model-assisted annotation pipeline for video.",
        ],
    },
    {
        when: "May 2019 – Aug 2019",
        title: "Software Engineer Intern",
        org: "Oculus",
        location: "Menlo Park",
        bullets: [
            "Built data-loading infrastructure, visualization, and metric dashboards for human pose estimation.",
        ],
    },
    {
        when: "Jun 2018 – Sep 2018",
        title: "Software Engineer Intern",
        org: "Google Ads",
        location: "Mountain View",
        bullets: [
            "Data pipelining infra and RPCs for entity sharing across microservices.",
        ],
    },
];

interface Edu {
    when: string;
    school: string;
    degree: string;
    bullets?: string[];
}

const EDUCATION: Edu[] = [
    {
        when: "2019 – 2021",
        school: "Stanford University",
        degree: "M.S., Computer Science in AI",
        bullets: [
            "Research Assistant — Stanford Vision & Learning Lab; paper @ CVPR 2021.",
            "Research Assistant — Stanford NLP Group; paper @ ACL 2022.",
            "Teaching Assistant for graduate-level CS courses.",
        ],
    },
    {
        when: "2015 – 2019",
        school: "UC San Diego",
        degree: "B.S., Computer Science",
        bullets: [
            "Magna cum laude.",
            "Head TA for introductory CS — wrote a full-feature auto-grading and assignment-publishing framework still in use.",
        ],
    },
];

function SectionHead({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="caption-mono text-hot mt-12 mb-1">
            {children}
        </h2>
    );
}

function Bullet({ children }: { children: React.ReactNode }) {
    return (
        <li className="relative pl-3 text-[10.5px] leading-[1.3] text-ink-muted">
            <span className="absolute left-0 top-[0.5em] h-[3px] w-[3px] rounded-full bg-ink-faint" />
            {children}
        </li>
    );
}

function RoleBlock({ r }: { r: Role }) {
    // Location and tag string share the eyebrow row, separated by a
    // pipe with breathing room so the location reads as distinct from
    // the dot-joined tag run, e.g.
    // `SEATTLE       |       DIFFUSION · INFERENCE · PRODUCTION`.
    const tagStr = r.tags && r.tags.length > 0 ? r.tags.join(" · ") : "";
    return (
        <div className="pt-4 first:pt-0 break-inside-avoid">
            <div className="flex items-baseline gap-2">
                <h3 className="font-sans font-bold text-[13.5px] leading-tight text-ink">
                    <span>{r.title}</span>
                    <span className="text-ink-faint"> · </span>
                    <span>{r.org}</span>
                </h3>
                <span className="ml-auto caption-mono text-ink-faint whitespace-nowrap">
                    {r.when.toUpperCase()}
                </span>
            </div>
            {(r.location || tagStr) && (
                <div className="mt-0.5 caption-mono text-ink-faint">
                    {r.location && <span>{r.location.toUpperCase()}</span>}
                    {r.location && tagStr && (
                        <span className="mx-3 text-ink-faint/50">|</span>
                    )}
                    {tagStr && <span>{tagStr}</span>}
                </div>
            )}
            <ul className="mt-0.5 space-y-0">
                {r.bullets.map((b, i) => (
                    <Bullet key={i}>{b}</Bullet>
                ))}
            </ul>
        </div>
    );
}

function EduBlock({ e }: { e: Edu }) {
    return (
        <div className="pt-4 first:pt-0 break-inside-avoid">
            <div className="flex items-baseline gap-2">
                <h3 className="font-serif text-[13.5px] leading-tight text-ink">
                    <span>{e.school}</span>
                    <span className="text-ink-faint"> · </span>
                    <span className="italic">{e.degree}</span>
                </h3>
                <span className="ml-auto caption-mono text-ink-faint whitespace-nowrap">
                    {e.when.toUpperCase()}
                </span>
            </div>
            {e.bullets && e.bullets.length > 0 && (
                <ul className="mt-0.5 space-y-0">
                    {e.bullets.map((b, i) => (
                        <Bullet key={i}>{b}</Bullet>
                    ))}
                </ul>
            )}
        </div>
    );
}

function ContactColumn() {
    // Plain-text contact lines (no links). Each row is label + icon —
    // icon on the right edge to match the right-aligned typographic
    // rail. The résumé is meant to read identically on paper and on
    // screen; live links are out.
    const rows: { icon: string; family: "fa-solid" | "fa-brands"; label: string }[] = [
        { icon: "fa-envelope", family: "fa-solid", label: EMAIL_DISPLAY },
        { icon: "fa-globe", family: "fa-solid", label: WEB_ADDR },
        { icon: "fa-linkedin", family: "fa-brands", label: "jkvc" },
        { icon: "fa-github", family: "fa-brands", label: "jkvc" },
        { icon: "fa-location-dot", family: "fa-solid", label: "Seattle" },
    ];

    return (
        <div className="text-right leading-none">
            {rows.map((r, i) => (
                <div key={i}>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] leading-none text-ink-muted py-[1px]">
                        <span>{r.label}</span>
                        <i className={`${r.family} ${r.icon} text-[10px] text-ink-faint w-3 text-center`} />
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function ResumePage() {
    return (
        <>
            {/* Print rules: US Letter at 0.5in margin. The on-screen sheet
                renders at the same physical dimensions so the preview is a
                faithful WYSIWYG. `print-color-adjust: exact` keeps the
                editorial red and ink colors when printed in color. */}
            <style>{`
                @page {
                    size: letter;
                    margin: 0.85in 0.85in;
                }
                @media print {
                    html, body {
                        background: #ffffff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .resume-chrome { display: none !important; }
                    .resume-sheet {
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: auto !important;
                        min-height: 0 !important;
                    }
                }
            `}</style>

            {/* Screen-only top chrome — same minimal mono caption motif as
                the rest of the site. ⌘P / Ctrl-P prints. */}
            <div className="resume-chrome fixed top-0 inset-x-0 z-50 bg-surface/95 backdrop-blur border-b border-rule">
                <div className="max-w-[8.5in] mx-auto px-6 h-12 flex items-center justify-between">
                    <span className="caption-mono text-ink-faint">
                        <span className="text-hot">⌘P</span>
                        <span> · </span>
                        <span>PRINT OR SAVE AS PDF</span>
                    </span>
                </div>
            </div>

            <div className="min-h-screen py-16 px-4 print:p-0 print:bg-white">
                {/* The "sheet" — sized to US Letter (8.5in × 11in). On
                    screen we add a soft shadow so it reads as a sheet of
                    paper laid on the page; in print we strip the shadow
                    and let the @page rules size it. */}
                <article
                    className="resume-sheet bg-white text-ink mx-auto shadow-[0_8px_40px_-12px_rgba(20,20,19,0.18)] print:shadow-none"
                    style={{
                        width: "8.5in",
                        minHeight: "11in",
                        padding: "0.85in",
                        boxSizing: "border-box",
                    }}
                >
                    {/* Masthead */}
                    <header className="flex items-start justify-between gap-8">
                        <div>
                            <h1 className="text-[40px] leading-none">
                                <Wordmark defaultExpanded interactive={false} />
                            </h1>
                            <p className="mt-2 text-[11px] leading-snug text-ink-muted max-w-[4.6in]">
                                ML engineer with experience in diffusion models, large-scale model inference systems, and LLM harnesses.
                                <br />
                                Broadly interested in human–AI collaboration in the real world for creativity.
                                <br />
                                Currently working at Meta Superintelligence Lab.
                            </p>
                        </div>
                        <ContactColumn />
                    </header>

                    {/* Experience */}
                    <section>
                        <SectionHead>Experience</SectionHead>
                        {EXPERIENCE.map((r, i) => (
                            <RoleBlock key={i} r={r} />
                        ))}
                    </section>

                    {/* Education */}
                    <section>
                        <SectionHead>Education &amp; Research</SectionHead>
                        {EDUCATION.map((e, i) => (
                            <EduBlock key={i} e={e} />
                        ))}
                    </section>
                </article>
            </div>
        </>
    );
}
