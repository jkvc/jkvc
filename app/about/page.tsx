import BottomBar from "@/app/components/BottomBar";
import IconCircleButton from "@/app/components/ui/IconCircleButton";

interface TimelineImage {
  alt: string;
}

interface TimelineSectionData {
  dateRange: string;
  organization: string;
  role: string;
  description: string;
  images: [TimelineImage, TimelineImage, TimelineImage];
  current?: boolean;
}

const sections: TimelineSectionData[] = [
  {
    dateRange: "Jul 2025 – Present",
    organization: "Meta Superintelligence Lab",
    role: "Prototyping",
    description:
      "Making things that feel like they're from the future, using the latest models.",
    images: [
      { alt: "Prototyping session at Meta Superintelligence Lab" },
      { alt: "AI interaction demo at Meta Superintelligence Lab" },
      { alt: "Novel UX exploration at Meta Superintelligence Lab" },
    ],
    current: true,
  },
  {
    dateRange: "Oct 2023 – Jun 2025",
    organization: "Meta Gen AI",
    role: "Research to Production",
    description:
      "Got deep into making diffusion models fast — wrote inference algorithms and shipped them at scale.",
    images: [
      { alt: "Diffusion model research at Meta Gen AI" },
      { alt: "Production AI infrastructure at Meta Gen AI" },
      { alt: "Model inference pipeline work at Meta Gen AI" },
    ],
  },
  {
    dateRange: "Oct 2021 – Sep 2023",
    organization: "Meta Computational Photography",
    role: "Computer Vision",
    description:
      "Made photos and videos on Meta's apps look better using CV and ML pipelines.",
    images: [
      { alt: "Computational photography research at Meta" },
      { alt: "Computer vision work at Meta" },
      { alt: "Media quality pipeline at Meta" },
    ],
  },
  {
    dateRange: "2018 – 2020",
    organization: "Stanford University",
    role: "Master's in AI/ML",
    description:
      "Research at Stanford NLP Group and the Vision Lab (SVL). Ended up at CVPR 2021 for vision-language navigation.",
    images: [
      { alt: "Stanford University campus" },
      { alt: "Stanford Vision and Learning Lab" },
      { alt: "Stanford NLP Group research environment" },
    ],
  },
  {
    dateRange: "2014 – 2018",
    organization: "UC San Diego",
    role: "B.S. Computer Science",
    description: "Studied CS by the beach. Go Tritons.",
    images: [
      { alt: "UC San Diego campus" },
      { alt: "UC San Diego Jacobs School of Engineering" },
      { alt: "UCSD campus life" },
    ],
  },
];

function PhotoPlaceholder({ alt, className }: { alt: string; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-[#E8E8E8] bg-[#F5F5F3] flex items-center justify-center ${className ?? ""}`}
      role="img"
      aria-label={alt}
      title={alt}
    >
      <i className="fa-regular fa-image text-[#D0CEC9] text-xl" />
    </div>
  );
}

function PhotoGrid({ images }: { images: TimelineSectionData["images"] }) {
  const [featured, a, b] = images;
  return (
    <div className="flex flex-col gap-1.5">
      {/* Featured landscape image */}
      <PhotoPlaceholder alt={featured.alt} className="aspect-[16/9] w-full" />
      {/* Two thumbnails */}
      <div className="grid grid-cols-2 gap-1.5">
        <PhotoPlaceholder alt={a.alt} className="aspect-square" />
        <PhotoPlaceholder alt={b.alt} className="aspect-square" />
      </div>
    </div>
  );
}

function TimelineSection({ section }: { section: TimelineSectionData }) {
  return (
    <div className="mb-14">
      {/* Photo app-style section header */}
      <div className="flex items-center gap-2.5 mb-3">
        {section.current && (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
          </span>
        )}
        <span className="text-[10px] uppercase tracking-widest text-text-faint whitespace-nowrap">
          {section.dateRange}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Photo grid */}
      <PhotoGrid images={section.images} />

      {/* Org + role + caption */}
      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-serif text-lg tracking-tight text-text-heading">
            {section.organization}
          </h2>
          <span className="text-[11px] text-gold">{section.role}</span>
        </div>
        <p className="mt-1 text-[13px] text-text-muted leading-relaxed">
          {section.description}
        </p>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div className="relative z-[1] min-h-screen text-text px-6 pt-4 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <section className="mt-24 mb-16">
          <h1 className="font-serif text-4xl tracking-tight text-text-heading">
            Junshen Kevin Chen
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-text-muted">
            Working at the intersection of creativity, models, and algorithms.
          </p>
        </section>

        {/* Timeline */}
        <section>
          {sections.map((section, i) => (
            <TimelineSection key={i} section={section} />
          ))}
        </section>

        <BottomBar />
        <div className="mt-4 flex justify-center">
          <IconCircleButton href="/" icon="fa-home" title="Home" size="md" iconClassName="text-[14px]" />
        </div>
      </div>
    </div>
  );
}
