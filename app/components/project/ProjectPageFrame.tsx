import RecipeHeader, {
  type RecipeMeta,
} from "@/app/components/editorial/RecipeHeader";
import type { ProjectKind } from "@/app/projects/data";

/**
 * Copy + glyph for the draft indicator pill, keyed by project kind. Playables
 * read as unfinished builds ("under construction"); readables as unfinished
 * writing ("draft"). Falls back to the generic playable-flavoured copy when
 * kind is absent.
 */
const DRAFT_BADGE: Record<ProjectKind, { icon: string; label: string }> = {
  playable: { icon: "fa-hammer", label: "Under construction" },
  readable: { icon: "fa-pen-nib", label: "Draft" },
};

interface Props {
  title: string;
  description: string;
  meta?: RecipeMeta;
  /** When true, render the draft indicator pill above the recipe header. */
  draft?: boolean;
  /** Drives which draft-badge copy/glyph gets shown. */
  kind?: ProjectKind;
  /** Extra node slotted above the draft badge — reserved for one-off banners. */
  headerAddon?: React.ReactNode;
  children: React.ReactNode;
  contentTopClassName?: string;
}

export default function ProjectPageFrame({
  title,
  description,
  meta,
  draft,
  kind,
  headerAddon,
  children,
  contentTopClassName = "mt-12",
}: Props) {
  const badge = draft ? DRAFT_BADGE[kind ?? "playable"] : null;

  return (
    <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div>
          {headerAddon}
          {badge && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-hot/40 caption-mono text-hot px-3 py-1 mb-3">
              <i className={`fa-solid ${badge.icon} text-[8px]`} />
              <span>{badge.label}</span>
            </div>
          )}
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
