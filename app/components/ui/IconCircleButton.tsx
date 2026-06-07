"use client";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { CONTROL_SIZE, type ControlSize } from "./controlSize";
import {
  STAMP_CONTROL_LIFT,
  STAMP_CONTROL_SHADOW,
  STAMP_FACE,
} from "@/app/lib/stamp";

type Shape = "circle" | "square";

interface BaseProps {
  icon: string;
  title: string;
  size?: ControlSize;
  shape?: Shape;
  iconFamily?: "fa-solid" | "fa-regular" | "fa-brands";
  iconClassName?: string;
  className?: string;
  active?: boolean;
  disabled?: boolean;
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

const ROOT = "group inline-flex cursor-pointer";

function wrapClasses(
  active: boolean,
  disabled: boolean,
  inverted: boolean,
  shape: Shape,
): string {
  if (disabled) return "";
  if (inverted && !active) return "";
  if (shape === "square") return "inline-flex";
  return "inline-flex rounded-full";
}

function faceClasses({
  size,
  active,
  disabled,
  inverted,
  shape,
  className,
}: {
  size: ControlSize;
  active: boolean;
  disabled: boolean;
  inverted: boolean;
  shape: Shape;
  className?: string;
}): string {
  let stateClasses: string;
  if (inverted) {
    stateClasses = active
      ? "border-hot text-hot bg-surface/10"
      : "border-surface/40 text-surface/70 hover:border-hot hover:text-hot bg-transparent";
  } else {
    stateClasses = active
      ? "border-ink bg-ink text-surface"
      : "border-ink bg-surface text-ink";
  }

  const shadow = inverted ? "" : STAMP_CONTROL_SHADOW;
  const lift = !active && !disabled && !inverted ? STAMP_CONTROL_LIFT : "";
  const disabledClasses = disabled ? "opacity-40 cursor-not-allowed" : "";
  const shapeClass = shape === "circle" ? "rounded-full" : "";

  return twMerge(
    STAMP_FACE,
    shadow,
    lift,
    "inline-flex items-center justify-center",
    shapeClass,
    CONTROL_SIZE[size].square,
    stateClasses,
    disabledClasses,
    className,
  );
}

function StampControl({
  wrapClassName,
  faceClassName,
  shape,
  iconFamily,
  icon,
  iconClassName,
}: {
  wrapClassName: string;
  faceClassName: string;
  shape: Shape;
  iconFamily: string;
  icon: string;
  iconClassName: string;
}) {
  const iconEl = (
    <i className={`${iconFamily} ${icon} ${iconClassName}`} />
  );
  if (!wrapClassName) {
    return <span className={faceClassName}>{iconEl}</span>;
  }
  return (
    <span
      className={twMerge(
        wrapClassName,
        shape === "circle" && "rounded-full",
        "inline-flex",
      )}
    >
      <span className={faceClassName}>{iconEl}</span>
    </span>
  );
}

export default function IconCircleButton(props: Props) {
  const size = props.size ?? "sm";
  const shape = props.shape ?? "circle";
  const active = props.active ?? false;
  const disabled = props.disabled ?? false;
  const inverted = props.inverted ?? false;
  const iconFamily = props.iconFamily ?? "fa-solid";
  const iconClassName = props.iconClassName ?? CONTROL_SIZE[size].circleIcon;
  const wrap = wrapClasses(active, disabled, inverted, shape);
  const face = faceClasses({
    size,
    active,
    disabled,
    inverted,
    shape,
    className: props.className,
  });
  const rootClass = twMerge(ROOT, disabled && "cursor-not-allowed");

  const href = "href" in props ? props.href : undefined;
  if (typeof href === "string") {
    const isExternal = props.external ?? /^https?:\/\//.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          target={props.target ?? "_blank"}
          rel={props.rel ?? "noopener noreferrer"}
          className={rootClass}
          title={props.title}
          aria-label={props.title}
        >
          <StampControl
            wrapClassName={wrap}
            faceClassName={face}
            shape={shape}
            iconFamily={iconFamily}
            icon={props.icon}
            iconClassName={iconClassName}
          />
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={rootClass}
        title={props.title}
        aria-label={props.title}
      >
        <StampControl
          wrapClassName={wrap}
          faceClassName={face}
          shape={shape}
          iconFamily={iconFamily}
          icon={props.icon}
          iconClassName={iconClassName}
        />
      </Link>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <button
      onClick={buttonProps.onClick}
      type={buttonProps.type ?? "button"}
      disabled={disabled}
      className={rootClass}
      title={props.title}
      aria-label={props.title}
    >
      <StampControl
        wrapClassName={wrap}
        faceClassName={face}
        shape={shape}
        iconFamily={iconFamily}
        icon={props.icon}
        iconClassName={iconClassName}
      />
    </button>
  );
}
