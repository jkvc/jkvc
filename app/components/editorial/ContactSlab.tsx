"use client";

import { useEffect, useState } from "react";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import { SITE } from "@/app/lib/site";

interface ContactSlabProps {
  /** Lower-right location line. */
  location?: string;
  className?: string;
}

const [EMAIL_USER, EMAIL_DOMAIN] = SITE.email.split("@");

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
        className="flex items-center gap-1.5 px-3 h-10 rounded-full border border-hot/60 text-hot text-[12px] font-mono"
      >
        <span>{EMAIL_USER}</span>
        <i className="fa-brands fa-google text-[12px]" />
      </a>
    );
  }

  return (
    <IconCircleButton
      onClick={() => setRevealed(true)}
      icon="fa-envelope"
      title="Reveal email"
      size="md"
      inverted
      iconClassName="text-[14px]"
    />
  );
}

/**
 * Minimal inverted dark strip. Row of contact icons left, location right.
 */
export default function ContactSlab({
  location = SITE.location,
  className = "",
}: ContactSlabProps) {
  return (
    <div
      className={`bg-ink text-surface rounded-2xl p-7 sm:p-8 relative overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <IconCircleButton
          href={SITE.social.linkedin}
          icon="fa-linkedin"
          iconFamily="fa-brands"
          title="LinkedIn"
          size="md"
          inverted
          iconClassName="text-[14px]"
        />
        <IconCircleButton
          href={SITE.social.github}
          icon="fa-github"
          iconFamily="fa-brands"
          title="GitHub"
          size="md"
          inverted
          iconClassName="text-[14px]"
        />
        <IconCircleButton
          href={SITE.social.scholar}
          icon="fa-graduation-cap"
          title="Google Scholar"
          size="md"
          inverted
          iconClassName="text-[14px]"
        />
        <EmailAction />

        <div className="ml-auto caption-mono text-surface/40">{location}</div>
      </div>
    </div>
  );
}
