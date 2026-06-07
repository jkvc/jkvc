"use client";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { CONTROL_SIZE, type ControlSize } from "../ui/controlSize";
import {
    STAMP_CONTROL_LIFT,
    STAMP_CONTROL_SHADOW,
    STAMP_FACE,
} from "@/app/lib/stamp";

/**
 * Handbook-style pill — sharp corners, 2px border, stamped shadow with
 * physical press/lift animation. Two states:
 *
 *   - inactive: white surface, ink border, small shadow; hover lifts face, stamp stays fixed.
 *   - active:   inverted — ink bg, surface text, shadow on wrap only.
 *   - inverted: for dark surfaces — dim chrome, accent hover.
 */

interface BaseProps {
    children: React.ReactNode;
    active?: boolean;
    size?: ControlSize;
    icon?: string;
    iconFamily?: "fa-solid" | "fa-regular" | "fa-brands";
    title?: string;
    className?: string;
    ariaPressed?: boolean;
    inverted?: boolean;
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

const ROOT = "group caption-mono inline-flex cursor-pointer";

function faceClasses({
    active,
    size,
    inverted,
    extra,
}: {
    active: boolean;
    size: ControlSize;
    inverted: boolean;
    extra?: string;
}): string {
    let state: string;
    if (inverted) {
        state = active
            ? "bg-surface text-ink border-surface"
            : "border-surface/30 text-surface/60 hover:border-hot hover:text-hot bg-transparent";
    } else {
        state = active
            ? "bg-ink text-surface border-ink"
            : "bg-surface border-ink text-ink-muted";
    }
    const shadow = !inverted ? STAMP_CONTROL_SHADOW : "";
    const lift = !active && !inverted ? STAMP_CONTROL_LIFT : "";
    const dims = `${CONTROL_SIZE[size].height} ${CONTROL_SIZE[size].pillPaddingX}`;
    return twMerge(
        STAMP_FACE,
        shadow,
        lift,
        "inline-flex items-center gap-1.5",
        state,
        dims,
        extra,
    );
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

function StampPill({
    wrapClassName,
    faceClassName,
    children,
}: {
    wrapClassName: string;
    faceClassName: string;
    children: React.ReactNode;
}) {
    if (!wrapClassName) {
        return <span className={faceClassName}>{children}</span>;
    }
    return (
        <span className={twMerge(wrapClassName, "inline-flex")}>
            <span className={faceClassName}>{children}</span>
        </span>
    );
}

export default function Pill(props: Props) {
    const active = props.active ?? false;
    const size = props.size ?? "xs";
    const inverted = props.inverted ?? false;
    const iconFamily = props.iconFamily ?? "fa-solid";
    const wrap = inverted && !active ? "" : "inline-flex";
    const face = faceClasses({ active, size, inverted, extra: props.className });

    if ("href" in props && typeof props.href === "string") {
        const isExternal = props.external ?? /^https?:\/\//.test(props.href);
        if (isExternal) {
            return (
                <a
                    href={props.href}
                    target={props.target ?? "_blank"}
                    rel={props.rel ?? "noopener noreferrer"}
                    title={props.title}
                    className={ROOT}
                >
                    <StampPill wrapClassName={wrap} faceClassName={face}>
                        <Body icon={props.icon} iconFamily={iconFamily}>
                            {props.children}
                        </Body>
                    </StampPill>
                </a>
            );
        }
        return (
            <Link href={props.href} title={props.title} className={ROOT}>
                <StampPill wrapClassName={wrap} faceClassName={face}>
                    <Body icon={props.icon} iconFamily={iconFamily}>
                        {props.children}
                    </Body>
                </StampPill>
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
            className={ROOT}
        >
            <StampPill wrapClassName={wrap} faceClassName={face}>
                <Body icon={btn.icon} iconFamily={iconFamily}>
                    {btn.children}
                </Body>
            </StampPill>
        </button>
    );
}
