"use client";

import Link from "next/link";
import { CONTROL_SIZE, type ControlSize } from "./controlSize";

interface BaseProps {
  icon: string;
  title: string;
  size?: ControlSize;
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

function getClasses({
  size,
  active,
  disabled,
  inverted,
  className,
}: {
  size: ControlSize;
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

  // inline-flex so the button can be placed mid-paragraph (e.g. the inline
  // About affordance in the home hero) without breaking the text line.
  return `inline-flex items-center justify-center rounded-full border transition-all ${CONTROL_SIZE[size].square} ${stateClasses} ${disabledClasses} ${
    className ?? ""
  }`;
}

export default function IconCircleButton(props: Props) {
  const size = props.size ?? "sm";
  const active = props.active ?? false;
  const disabled = props.disabled ?? false;
  const inverted = props.inverted ?? false;
  const iconFamily = props.iconFamily ?? "fa-solid";
  const iconClassName = props.iconClassName ?? CONTROL_SIZE[size].circleIcon;
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
