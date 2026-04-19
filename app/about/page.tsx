import ContactSlab from "@/app/components/editorial/ContactSlab";
import RecipeHeader from "@/app/components/editorial/RecipeHeader";
import { SITE } from "@/app/lib/site";

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
    <div className="border-b border-rule py-6">
      {/* Eyebrow: date range + current pulse */}
      <div className="flex items-center gap-2.5">
        {section.current && (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hot opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-hot" />
          </span>
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {section.dateRange.toUpperCase()}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          ·
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {section.role.toUpperCase()}
        </span>
      </div>

      {/* Organization */}
      <h2 className="mt-2 font-serif italic text-2xl leading-tight text-ink">
        {section.organization}
      </h2>

      {/* Description */}
      <p className="mt-2 text-[14px] text-ink-muted leading-relaxed max-w-xl">
        {section.description}
      </p>

      {/* Tag string */}
      {tagString && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {tagString}
        </p>
      )}
    </div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <RecipeHeader meta={{ issue: "ABOUT" }} />

        {/* Hero — middle word of the full name renders italic+red. Assumes
            three-word name; adjust split if that ever changes. */}
        <section className="mt-6 mb-14">
          <h1 className="font-serif text-5xl sm:text-6xl leading-[1.02] tracking-[-0.02em] text-ink">
            {(() => {
              const [first, middle, ...rest] = SITE.fullName.split(" ");
              return (
                <>
                  {first}{" "}
                  <span className="italic text-hot">{middle}</span>{" "}
                  {rest.join(" ")}
                </>
              );
            })()}
          </h1>
          <p className="mt-6 font-serif italic text-xl leading-relaxed text-ink-muted max-w-xl">
            {SITE.about.description}
          </p>
        </section>

        {/* Timeline */}
        <section className="border-t border-rule">
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
