import Link from "next/link";
import StampShell from "@/app/components/ui/StampShell";

interface ProjectCardProps {
  title: string;
  slug: string;
  description: string;
  gradient: string;
  thumbnail?: string;
  draft?: boolean;
}

export default function ProjectCard({
  title,
  slug,
  description,
  gradient,
  thumbnail,
  draft,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`} className="group aspect-square block cursor-pointer">
      <StampShell variant="card" interactive faceClassName="relative h-full overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-200 group-hover:scale-105"
            style={{ background: gradient }}
          />
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/60" />
        {draft && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="caption-mono inline-flex h-6 w-6 items-center justify-center border border-ink bg-ink text-[9px] text-surface">
              <i className="fa-solid fa-hammer" />
            </span>
          </div>
        )}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <h3 className="text-sm font-bold uppercase tracking-tight text-white">
            {title}
          </h3>
          <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-white/70">
            {description}
          </p>
        </div>
      </StampShell>
    </Link>
  );
}
