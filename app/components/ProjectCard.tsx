import Link from "next/link";

interface ProjectCardProps {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  gradient: string;
  draft?: boolean;
}

export default function ProjectCard({
  title,
  slug,
  description,
  tags,
  gradient,
  draft,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer block"
    >
      <div
        className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
        style={{ background: gradient }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
      {draft && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <span className="bg-black/60 text-white text-xs rounded px-1.5 py-0.5" title="Hidden in production">🚧</span>
          <span className="bg-black/60 text-white text-xs rounded px-1.5 py-0.5" title="Not public">🙈</span>
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white font-medium text-sm">{title}</h3>
        <p className="text-white/70 text-xs mt-1 line-clamp-2">
          {description}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-white/60 border border-white/30 rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
