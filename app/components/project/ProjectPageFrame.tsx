import RecipeHeader, {
  type RecipeMeta,
} from "@/app/components/editorial/RecipeHeader";
import Pill from "@/app/components/editorial/Pill";
import StampShell from "@/app/components/ui/StampShell";
import { resolveRef, type ProjectKind, type Ref } from "@/app/projects/data";

const DRAFT_BADGE: Record<ProjectKind, { icon: string; label: string }> = {
  playable: { icon: "fa-hammer", label: "Under construction" },
  readable: { icon: "fa-pen-nib", label: "Draft" },
};

interface Props {
  title: string;
  description: string;
  meta?: RecipeMeta;
  draft?: boolean;
  kind?: ProjectKind;
  headerAddon?: React.ReactNode;
  refs?: Ref[];
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
  refs,
  children,
  contentTopClassName = "mt-12",
}: Props) {
  const badge = draft ? DRAFT_BADGE[kind ?? "playable"] : null;

  return (
    <div className="min-h-screen text-ink px-6 pt-8 pb-16 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div>
          {headerAddon}
          {badge && (
            <StampShell
              variant="control"
              inline
              bleed={false}
              className="mb-3"
              faceClassName="caption-mono items-center gap-1.5 px-3 py-1 text-hot"
            >
              <i className={`fa-solid ${badge.icon} text-[8px]`} />
              <span>{badge.label}</span>
            </StampShell>
          )}
          {meta && <RecipeHeader meta={meta} />}
          <h1 className="mt-8 font-sans font-black text-5xl leading-[1.05] tracking-tight text-ink uppercase">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted max-w-xl">
            {description}
          </p>
          {refs && refs.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {refs.map((ref, i) => {
                const r = resolveRef(ref);
                return (
                  <Pill
                    key={i}
                    href={r.url}
                    icon={r.icon}
                    iconFamily={r.iconFamily}
                    title={r.url}
                  >
                    {r.label}
                  </Pill>
                );
              })}
            </div>
          )}
        </div>

        <div className={contentTopClassName}>{children}</div>
      </div>
    </div>
  );
}
