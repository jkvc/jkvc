import Wordmark from "@/app/components/brand/Wordmark";
import ContactSlab from "@/app/components/editorial/ContactSlab";
import RecipeHeader from "@/app/components/editorial/RecipeHeader";
import { SITE } from "@/app/lib/site";
import { renderInlineMarkdown } from "@/app/lib/inline-markdown";

interface TimelineSectionData {
  dateRange: string;
  organization: string;
  role: string;
  description: string;
  tags?: string[];
  current?: boolean;
}

const sections: TimelineSectionData[] = [
  {
    dateRange: "Jul 2025 – Present",
    organization: "Meta Superintelligence Lab",
    role: "Prototyping",
    description:
      "Making things that feel like they're from the future, using the latest models.",
    tags: ["PROTOTYPES", "MULTIMODAL", "INTERACTION"],
    current: true,
  },
  {
    dateRange: "Oct 2023 – Jun 2025",
    organization: "Meta Gen AI",
    role: "Research to Production",
    description:
      "Got deep into making diffusion models fast — wrote inference algorithms and shipped them at scale.",
    tags: ["DIFFUSION", "INFERENCE", "PRODUCTION"],
  },
  {
    dateRange: "Oct 2021 – Sep 2023",
    organization: "Meta Computational Photography",
    role: "Computer Vision",
    description:
      "Made photos and videos on Meta's apps look better using CV and ML pipelines.",
    tags: ["CV", "ML PIPELINES", "MOBILE"],
  },
  {
    dateRange: "2018 – 2020",
    organization: "Stanford University",
    role: "Master's in AI/ML",
    description:
      "Research at Stanford NLP Group and the Vision Lab (SVL). Ended up at CVPR 2021 for vision-language navigation.",
    tags: ["NLP", "VISION-LANGUAGE", "CVPR 2021"],
  },
  {
    dateRange: "2014 – 2018",
    organization: "UC San Diego",
    role: "B.S. Computer Science",
    description: "Studied CS by the beach. Go Tritons.",
    tags: ["COMPUTER SCIENCE", "GO TRITONS"],
  },
];

function TimelineRow({ section }: { section: TimelineSectionData }) {
  const tagString = (section.tags ?? []).map((t) => t.toUpperCase()).join(" · ");

  return (
    <div className="py-6">
      {/* Eyebrow: date range + current pulse. Uses the shared `caption-mono`
          editorial utility — do NOT re-spell the mono/size/tracking classes. */}
      <div className="flex items-center gap-2.5 caption-mono text-ink-faint">
        {section.current && (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hot opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-hot" />
          </span>
        )}
        <span>{section.dateRange.toUpperCase()}</span>
        <span>·</span>
        <span>{section.role.toUpperCase()}</span>
      </div>

      <h2 className="mt-2 font-serif text-2xl leading-tight text-ink">
        {section.organization}
      </h2>

      <p className="mt-2 text-[14px] text-ink-muted leading-relaxed max-w-xl">
        {section.description}
      </p>

      {tagString && (
        <p className="mt-3 caption-mono text-ink-faint">{tagString}</p>
      )}
    </div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <RecipeHeader meta={{ issue: "ABOUT" }} />

        {/* Hero — uses the shared Wordmark component pinned to the expanded
            ("Junshen Kevin Chen") form. No hover interaction here; the
            canonical full name is the one and only state on /about. */}
        <section className="mt-6 mb-14">
          <h1 className="text-5xl sm:text-6xl text-ink">
            <Wordmark defaultExpanded interactive={false} />
          </h1>
          {/* Subtitle is identical to the home-page tagline (same source,
              same classes, same inline-markdown rendering) so the hero on
              `/` and `/about` reads as a continuous statement. */}
          <p className="mt-6 text-sm leading-relaxed text-ink-muted">
            {renderInlineMarkdown(SITE.tagline)}
          </p>
        </section>

        {/* Timeline — `divide-y` draws a hairline only between rows, no
            border at the top or bottom of the list (same pattern as the
            project rows on the home page). */}
        <section className="divide-y divide-rule">
          {sections.map((section, i) => (
            <TimelineRow key={i} section={section} />
          ))}
        </section>

        <div className="mt-16">
          <ContactSlab />
        </div>
      </div>
    </div>
  );
}
