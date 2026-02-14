interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  status?: string;
  href?: string;
}

export default function ProjectCard({
  title,
  description,
  tags,
  status = "In Progress",
  href,
}: ProjectCardProps) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h3 className="card-title">{title}</h3>
          <div className="badge badge-outline badge-sm">{status}</div>
        </div>
        <p className="text-base-content/70">{description}</p>
        <div className="card-actions mt-2">
          {tags.map((tag) => (
            <div key={tag} className="badge badge-primary badge-sm">
              {tag}
            </div>
          ))}
        </div>
        {href && (
          <div className="card-actions justify-end mt-4">
            <a
              href={href}
              className="btn btn-sm btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Demo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
