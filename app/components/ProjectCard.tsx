import Link from "next/link";

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
    <Link
      href={`/projects/${slug}`}
      className="aspect-square relative overflow-hidden rounded-2xl group cursor-pointer block"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-[2px]"
        />
      ) : (
        <div
          className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
          style={{ background: gradient }}
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
      {draft && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/50 text-white text-[10px]">
            <i className="fa-solid fa-hammer" />
          </span>
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white font-serif text-sm">{title}</h3>
        <p className="text-white/60 text-[11px] mt-1 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </Link>
  );
}
