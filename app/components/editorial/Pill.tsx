"use client";

import Link from "next/link";
import { CONTROL_SIZE, type ControlSize } from "../ui/controlSize";

/**
 * Pill — the universal editorial pill button.
 *
 * Shape and typography are standardized: rounded-full, hairline border, mono
 * caption type (`caption-mono` utility), slight horizontal padding. Two states:
 *
 *   - inactive: `border-rule text-ink-muted`, hover flips to full-contrast ink.
 *   - active:   inverted — `bg-ink text-surface border-ink`.
 *
 * Renders as `<button>` by default, as `<Link>` when `href` is provided, as
 * plain `<a target>` when `external` is true. Icon prefix is optional and sits
 * at caption scale (10px) to match the text.
 *
 * Sizing shares the `ControlSize` token with `IconCircleButton`: at any given
 * `size` a pill and a circle render at the same height (the pill's width is
 * still intrinsic to its content). Default is `"xs"` to match the historical
 * caption-pill metrics.
 *
 * Do NOT restyle pills inline — if a variant is needed (e.g. pressed, inverted
 * for dark surfaces), add it here.
 */

interface BaseProps {
  children: React.ReactNode;
  active?: boolean;
  /** Shared with `IconCircleButton`. Default `"xs"`. */
  size?: ControlSize;
  /** Font Awesome class (without family prefix), e.g. "fa-eye". */
  icon?: string;
  iconFamily?: "fa-solid" | "fa-regular" | "fa-brands";
  title?: string;
  className?: string;
  /** Accessibility toggle state for button variant (e.g. drafts toggle). */
  ariaPressed?: boolean;
}

type ButtonVariant = BaseProps & {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  href?: never;
  external?: never;
  target?: never;
  rel?: never;
};

type LinkVariant = BaseProps & {
  href: string;
  external?: boolean;
  target?: string;
  rel?: string;
  onClick?: never;
  type?: never;
};

type Props = ButtonVariant | LinkVariant;

const BASE =
  "caption-mono rounded-full border transition-colors inline-flex items-center gap-1.5 cursor-pointer";

function classes({
  active,
  size,
  extra,
}: {
  active: boolean;
  size: ControlSize;
  extra?: string;
}): string {
  const state = active
    ? "bg-ink text-surface border-ink"
    : "border-rule text-ink-muted hover:border-ink hover:text-ink";
  const dims = `${CONTROL_SIZE[size].height} ${CONTROL_SIZE[size].pillPaddingX}`;
  return `${BASE} ${dims} ${state} ${extra ?? ""}`;
}

function Body({
  icon,
  iconFamily,
  children,
}: {
  icon?: string;
  iconFamily: "fa-solid" | "fa-regular" | "fa-brands";
  children: React.ReactNode;
}) {
  return (
    <>
      {icon && <i className={`${iconFamily} ${icon} text-[10px]`} aria-hidden="true" />}
      <span>{children}</span>
    </>
  );
}

export default function Pill(props: Props) {
  const active = props.active ?? false;
  const size = props.size ?? "xs";
  const iconFamily = props.iconFamily ?? "fa-solid";
  const cls = classes({ active, size, extra: props.className });

  if ("href" in props && typeof props.href === "string") {
    const isExternal = props.external ?? /^https?:\/\//.test(props.href);
    if (isExternal) {
      return (
        <a
          href={props.href}
          target={props.target ?? "_blank"}
          rel={props.rel ?? "noopener noreferrer"}
          title={props.title}
          className={cls}
        >
          <Body icon={props.icon} iconFamily={iconFamily}>
            {props.children}
          </Body>
        </a>
      );
    }
    return (
      <Link href={props.href} title={props.title} className={cls}>
        <Body icon={props.icon} iconFamily={iconFamily}>
          {props.children}
        </Body>
      </Link>
    );
  }

  const btn = props as ButtonVariant;
  return (
    <button
      type={btn.type ?? "button"}
      onClick={btn.onClick}
      title={btn.title}
      aria-pressed={btn.ariaPressed}
      className={cls}
    >
      <Body icon={btn.icon} iconFamily={iconFamily}>
        {btn.children}
      </Body>
    </button>
  );
}
