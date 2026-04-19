import { ImageResponse } from "next/og";
import { SITE } from "./lib/site";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SURFACE = "#F3ECDD";
const INK = "#1C1812";
const INK_FAINT = "#A69B8E";
const HOT = "#C0392B";

function DottedRing({ size: s = 120 }: { size?: number }) {
    const cx = s / 2;
    const cy = s / 2;
    const r = s / 2 - 4;
    const dotR = s * 0.028;
    const points = Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={dotR} fill={HOT} />
            ))}
            <circle cx={cx} cy={cy} r={dotR * 1.4} fill={HOT} />
        </svg>
    );
}

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: SURFACE,
                    color: INK,
                    display: "flex",
                    flexDirection: "column",
                    padding: "64px 80px",
                    fontFamily: "Georgia, serif",
                }}
            >
                {/* Masthead */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        paddingTop: 18,
                        paddingBottom: 18,
                        borderTop: `1px solid ${INK_FAINT}`,
                        borderBottom: `1px solid ${INK_FAINT}`,
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, color: INK_FAINT, fontSize: 18, letterSpacing: "0.22em", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                        <span>DIFFUSION · LLMS · INTERACTION</span>
                        <span>{SITE.location}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                        <span style={{ color: INK_FAINT, fontSize: 18, letterSpacing: "0.22em", fontFamily: "ui-monospace, SFMono-Regular, monospace", paddingTop: 2 }}>
                            EST. {SITE.est}
                        </span>
                        <DottedRing size={72} />
                    </div>
                </div>

                {/* Hero */}
                <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                fontSize: 280,
                                lineHeight: 1,
                                letterSpacing: "-0.04em",
                                fontWeight: 500,
                                display: "flex",
                            }}
                        >
                            <span style={{ color: INK }}>j</span>
                            <span style={{ color: HOT, fontStyle: "italic" }}>kv</span>
                            <span style={{ color: INK }}>c</span>
                        </div>
                        <div
                            style={{
                                marginTop: 24,
                                fontSize: 34,
                                fontStyle: "italic",
                                color: INK,
                                opacity: 0.72,
                                maxWidth: 900,
                                lineHeight: 1.3,
                            }}
                        >
                            A human enthusiast.
                        </div>
                    </div>
                </div>

                {/* Bottom caption */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: INK_FAINT,
                        fontSize: 18,
                        letterSpacing: "0.22em",
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                        paddingTop: 16,
                        borderTop: `1px solid ${INK_FAINT}`,
                    }}
                >
                    <span>{SITE.fullName.toUpperCase()}</span>
                    <span>{SITE.url.replace(/^https?:\/\//, "").toUpperCase()}</span>
                </div>
            </div>
        ),
        { ...size }
    );
}
