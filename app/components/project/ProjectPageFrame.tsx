import IconCircleButton from "@/app/components/ui/IconCircleButton";

interface Props {
  title: string;
  description: string;
  headerAddon?: React.ReactNode;
  children: React.ReactNode;
  contentTopClassName?: string;
  showHomeButton?: boolean;
}

export default function ProjectPageFrame({
  title,
  description,
  headerAddon,
  children,
  contentTopClassName = "mt-10",
  showHomeButton = true,
}: Props) {
  return (
    <div className="min-h-screen bg-surface text-text px-6 pt-20 pb-20 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div>
          {headerAddon}
          <h1 className="font-serif text-3xl tracking-tight text-text-heading">
            {title}
          </h1>
          <p className="mt-2.5 text-[13px] leading-relaxed text-text-muted">
            {description}
          </p>
        </div>

        <div className={contentTopClassName}>
          {children}
        </div>

        {showHomeButton && (
          <div className="mt-16 flex justify-center">
            <IconCircleButton
              href="/"
              icon="fa-house"
              size="md"
              title="Home"
              external={false}
              iconClassName="text-[13px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
