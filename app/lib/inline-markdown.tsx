import type { ReactNode } from "react";

/**
 * Tiny inline-markdown renderer for short site copy (taglines, hero
 * subtitles). Intentionally minimal — supports only:
 *
 *   - `~~text~~`     → strikethrough (`<span style="text-decoration:line-through">`)
 *   - `[text](url)`  → link (plain `<a>`; full-page nav for internal hrefs)
 *   - `\n`           → soft line break (`<br>`)
 *
 * Why not a real markdown engine: the same string renders both in the home
 * page DOM and in the `next/og` Satori subset. Hand-rolled tokenizer with
 * vanilla `<a>` / `<span style>` / `<br>` keeps the output portable across
 * both, and lets the result compose inline with sibling JSX.
 *
 * Trade-offs:
 * - Plain `<a>` (not `next/link`) means internal links cause a full reload.
 *   Acceptable here because tagline/hero links are rarely clicked, and the
 *   helper has to render under Satori where `next/link` is meaningless.
 * - Strikethrough uses inline `text-decoration` rather than `<s>` for
 *   Satori compatibility (Satori only renders a subset of HTML elements but
 *   does honor `text-decoration`).
 */

// One alternation handles all inline patterns. Group layout:
//   1: link text          2: link url
//   3: strikethrough text
const TOKEN_RE = /\[([^\]]+)\]\(([^)]+)\)|~~([^~]+?)~~/g;

export function renderInlineMarkdown(input: string): ReactNode {
    const out: ReactNode[] = [];
    const lines = input.split("\n");
    lines.forEach((line, lineIdx) => {
        const lineKey = `l${lineIdx}`;
        // Fresh regex per line — TOKEN_RE has the global flag and we walk it
        // statefully, so we can't share one instance across lines.
        const re = new RegExp(TOKEN_RE.source, TOKEN_RE.flags);
        let lastIndex = 0;
        let segIdx = 0;
        let match: RegExpExecArray | null;
        while ((match = re.exec(line)) !== null) {
            if (match.index > lastIndex) {
                out.push(line.slice(lastIndex, match.index));
            }
            const [, linkText, linkUrl, strikeText] = match;
            const key = `${lineKey}t${segIdx++}`;
            if (linkText !== undefined && linkUrl !== undefined) {
                out.push(
                    <a
                        key={key}
                        href={linkUrl}
                        style={{
                            color: "inherit",
                            textDecoration: "underline",
                            textUnderlineOffset: "0.18em",
                        }}
                    >
                        {linkText}
                    </a>,
                );
            } else if (strikeText !== undefined) {
                out.push(
                    <span
                        key={key}
                        style={{ textDecoration: "line-through" }}
                    >
                        {strikeText}
                    </span>,
                );
            }
            lastIndex = re.lastIndex;
        }
        if (lastIndex < line.length) {
            out.push(line.slice(lastIndex));
        }
        if (lineIdx < lines.length - 1) {
            out.push(<br key={`${lineKey}br`} />);
        }
    });
    return out;
}
