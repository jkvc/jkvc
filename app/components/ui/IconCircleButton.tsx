"use client";

import Link from "next/link";

type Size = "sm" | "md";

interface BaseProps {
  icon: string;
  title: string;
  size?: Size;
  iconFamily?: "fa-solid" | "fa-regular" | "fa-brands";
  iconClassName?: string;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  /** Inverted variant for use on dark surfaces (e.g. ContactSlab). */
  inverted?: boolean;
}

type ButtonProps = BaseProps & {
  onClick: () => void;
  href?: never;
  target?: never;
  rel?: never;
  external?: never;
  type?: "button" | "submit" | "reset";
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
  target?: string;
  rel?: string;
  external?: boolean;
};

type Props = ButtonProps | LinkProps;

const SIZE_MAP: Record<Size, string> = {
  sm: "w-9 h-9",
  md: "w-10 h-10",
};

function getClasses({
  size,
  active,
  disabled,
  inverted,
  className,
}: {
  size: Size;
  active: boolean;
  disabled: boolean;
  inverted: boolean;
  className?: string;
}) {
  let stateClasses: string;
  if (inverted) {
    stateClasses = active
      ? "border-hot text-hot"
      : "border-surface/25 text-surface/60 hover:border-hot hover:text-hot";
  } else {
    stateClasses = active
      ? "border-ink text-ink"
      : "border-rule text-ink-faint hover:border-ink hover:text-ink";
  }

  const disabledClasses = disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer";

  return `flex items-center justify-center rounded-full border transition-all ${SIZE_MAP[size]} ${stateClasses} ${disabledClasses} ${
    className ?? ""
  }`;
}

export default function IconCircleButton(props: Props) {
  const size = props.size ?? "sm";
  const active = props.active ?? false;
  const disabled = props.disabled ?? false;
  const inverted = props.inverted ?? false;
  const iconFamily = props.iconFamily ?? "fa-solid";
  const iconClassName = props.iconClassName ?? (size === "md" ? "text-[14px]" : "text-[13px]");
  const classes = getClasses({ size, active, disabled, inverted, className: props.className });

  const href = "href" in props ? props.href : undefined;
  if (typeof href === "string") {
    const isExternal = props.external ?? /^https?:\/\//.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          target={props.target ?? "_blank"}
          rel={props.rel ?? "noopener noreferrer"}
          className={classes}
          title={props.title}
          aria-label={props.title}
        >
          <i className={`${iconFamily} ${props.icon} ${iconClassName}`} />
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={classes}
        title={props.title}
        aria-label={props.title}
      >
        <i className={`${iconFamily} ${props.icon} ${iconClassName}`} />
      </Link>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <button
      onClick={buttonProps.onClick}
      type={buttonProps.type ?? "button"}
      disabled={disabled}
      className={classes}
      title={props.title}
      aria-label={props.title}
    >
      <i className={`${iconFamily} ${props.icon} ${iconClassName}`} />
    </button>
  );
}
