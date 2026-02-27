"use client";

import { useState } from "react";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import BottomBar from "@/app/components/BottomBar";

interface TimelineEntry {
  period: string;
  organization: string;
  role: string;
  description: string;
  skills?: string[];
}

const timeline: TimelineEntry[] = [
  {
    period: "Present",
    organization: "Meta Super Intelligence Lab",
    role: "Prototyping",
    description: "Creating novel user experiences with cutting-edge model capabilities",
    skills: ["AI Products", "Novel Experiences", "Prototyping"],
  },
  {
    period: "Previously",
    organization: "Meta Gen AI",
    role: "Research to Production",
    description:
      "Specialized in diffusion model inference algorithms, built scalable systems for model inference in production",
    skills: ["Diffusion Models", "Inference Algorithms", "Production Systems"],
  },
  {
    period: "Earlier",
    organization: "Meta Computational Photography",
    role: "Computer Vision",
    description: "Media understanding and quality with classic CV and ML approaches",
    skills: ["Computer Vision", "Media Quality", "CV/ML"],
  },
  {
    period: "2018-2020",
    organization: "Stanford University",
    role: "Master's in AI/ML",
    description: "Worked at Stanford NLP and SVL (Stanford Vision and Learning Lab)",
    skills: ["NLP", "Vision", "Research"],
  },
  {
    period: "2014-2018",
    organization: "UC San Diego",
    role: "B.S. Computer Science",
    description: "Undergraduate degree in Computer Science",
    skills: ["Computer Science", "Foundations"],
  },
];

function EmailButton() {
  const [revealed, setRevealed] = useState(false);
  const email = ["jkvc", "dev"].join(".") + "@" + ["gmail", "com"].join(".");

  if (revealed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold/50 text-gold text-sm">
        <i className="fa-solid fa-envelope text-[13px]" />
        <span className="font-mono text-[13px]">{email}</span>
      </div>
    );
  }

  return (
    <IconCircleButton
      onClick={() => setRevealed(true)}
      icon="fa-envelope"
      title="Reveal email"
      size="md"
      iconClassName="text-[14px]"
    />
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-surface text-text px-6 pt-4 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <section className="mt-24 mb-12">
          <h1 className="font-serif text-4xl tracking-tight text-text-heading">About</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-text-muted">
            Working at the intersection of creativity, models, and algorithms.
          </p>
        </section>

        {/* Timeline */}
        <section className="mt-16">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-8 bottom-8 w-px bg-border" />

            {/* Timeline entries */}
            <div className="space-y-10">
              {timeline.map((entry, index) => (
                <div key={index} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full border-2 ${
                        index === 0
                          ? "bg-gold border-gold"
                          : "bg-surface border-border"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-text-faint">
                        {entry.period}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl tracking-tight text-text-heading mb-1">
                      {entry.organization}
                    </h3>
                    <p className="text-sm text-gold mb-2">{entry.role}</p>
                    <p className="text-[13px] text-text-muted leading-relaxed mb-3">
                      {entry.description}
                    </p>
                    {entry.skills && (
                      <div className="flex flex-wrap gap-2">
                        {entry.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-3 py-1 rounded-full border border-border-dashed text-text-muted"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current Focus */}
        <section className="mt-20">
          <h2 className="text-[10px] uppercase tracking-widest text-text-faint mb-4">
            Current Focus
          </h2>
          <p className="text-[13px] text-text-muted leading-relaxed">
            These days I work in equal parts creativity, models, and algorithms — exploring how
            advanced AI capabilities can enable entirely new forms of user interaction and creative
            expression.
          </p>
        </section>

        {/* Connect */}
        <section className="mt-16">
          <h2 className="text-[10px] uppercase tracking-widest text-text-faint mb-4">
            Connect
          </h2>
          <div className="flex flex-wrap gap-3">
            <IconCircleButton
              href="https://www.linkedin.com/in/jkvc"
              icon="fa-linkedin"
              iconFamily="fa-brands"
              title="LinkedIn"
              size="md"
              iconClassName="text-[14px]"
            />
            <IconCircleButton
              href="https://scholar.google.com/citations?user=YOUR_ID"
              icon="fa-graduation-cap"
              title="Google Scholar"
              size="md"
              iconClassName="text-[14px]"
            />
            <EmailButton />
          </div>
        </section>

        <BottomBar />
      </div>
    </div>
  );
}
