import RecipeHeader, {
  type RecipeMeta,
} from "@/app/components/editorial/RecipeHeader";

interface Props {
  title: string;
  description: string;
  meta?: RecipeMeta;
  headerAddon?: React.ReactNode;
  children: React.ReactNode;
  contentTopClassName?: string;
}

export default function ProjectPageFrame({
  title,
  description,
  meta,
  headerAddon,
  children,
  contentTopClassName = "mt-12",
}: Props) {
  return (
    <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div>
          {headerAddon}
          {meta && <RecipeHeader meta={meta} />}
          <h1 className="mt-6 font-serif italic text-5xl leading-[1.05] tracking-[-0.02em] text-ink">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted max-w-xl">
            {description}
          </p>
        </div>

        <div className={contentTopClassName}>{children}</div>
      </div>
    </div>
  );
}
