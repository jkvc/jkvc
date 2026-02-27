import BottomBar from "@/app/components/BottomBar";

interface TimelineImage {
  alt: string;
}

interface TimelineSectionData {
  dateRange: string;
  organization: string;
  role: string;
  description: string;
  images: TimelineImage[];
  current?: boolean;
}

const sections: TimelineSectionData[] = [
  {
    dateRange: "Jul 2025 – Present",
    organization: "Meta Superintelligence Lab",
    role: "Prototyping",
    description:
      "Creating novel user experiences with cutting-edge model capabilities.",
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
      "Specialized in diffusion model inference algorithms, built scalable systems for model inference in production.",
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
      "Media understanding and quality using classic computer vision and ML approaches.",
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
      "Worked at Stanford NLP Group and Stanford Vision and Learning Lab (SVL). Published research in vision-and-language navigation at CVPR 2021.",
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
    description: "Undergraduate degree in Computer Science.",
    images: [
      { alt: "UC San Diego campus" },
      { alt: "UC San Diego Jacobs School of Engineering" },
      { alt: "UCSD computer science department" },
    ],
  },
];

function PhotoPlaceholder({ alt }: { alt: string }) {
  return (
    <div
      className="aspect-square rounded-lg border border-[#E8E8E8] bg-[#F5F5F3] flex items-center justify-center"
      role="img"
      aria-label={alt}
      title={alt}
    >
      <i className="fa-regular fa-image text-[#D0CEC9] text-xl" />
    </div>
  );
}

function TimelineSection({ section }: { section: TimelineSectionData }) {
  return (
    <div className="mb-12">
      {/* Gallery-style section divider */}
      <div className="flex items-center gap-3 mb-5">
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

      {/* Org + role */}
      <div className="mb-4">
        <h2 className="font-serif text-xl tracking-tight text-text-heading">
          {section.organization}
        </h2>
        <p className="text-sm text-gold mt-0.5">{section.role}</p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {section.images.map((img, i) => (
          <PhotoPlaceholder key={i} alt={img.alt} />
        ))}
      </div>

      {/* Description */}
      <p className="text-[13px] text-text-muted leading-relaxed">
        {section.description}
      </p>
    </div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-surface text-text px-6 pt-4 pb-16 sm:px-8">
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

        <BottomBar showHome />
      </div>
    </div>
  );
}
