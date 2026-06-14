import { describe, expect, it } from "vitest";
import { resolvePostImageLayout } from "@/app/components/post/postImageStyles";

describe("resolvePostImageLayout", () => {
  it("defaults to max-w-xl on the image with a shrink-wrapped wrapper", () => {
    const layout = resolvePostImageLayout({});
    expect(layout.wrapperClassName).toContain("w-fit");
    expect(layout.wrapperClassName).toContain("mx-auto");
    expect(layout.wrapperStyle).toBeUndefined();
    expect(layout.imgClassName).toContain("max-w-xl");
    expect(layout.imgClassName).toContain("w-full");
  });

  it("applies columnWidth as a centered wrapper percentage", () => {
    const layout = resolvePostImageLayout({ columnWidth: 0.7 });
    expect(layout.wrapperClassName).not.toContain("w-fit");
    expect(layout.wrapperStyle).toEqual({ width: "70%" });
    expect(layout.imgClassName).toContain("w-full");
    expect(layout.imgClassName).not.toContain("max-w-xl");
  });

  it("clamps columnWidth to 1", () => {
    const layout = resolvePostImageLayout({ columnWidth: 1.5 });
    expect(layout.wrapperStyle).toEqual({ width: "100%" });
  });

  it("applies maxWidth to the wrapper so the stamp matches", () => {
    const layout = resolvePostImageLayout({ maxWidth: "2xl" });
    expect(layout.wrapperClassName).toContain("max-w-2xl");
    expect(layout.wrapperClassName).toContain("w-fit");
    expect(layout.imgClassName).toContain("w-full");
    expect(layout.imgClassName).not.toContain("max-w-xl");
  });

  it("lets className override the default max width on the image", () => {
    const layout = resolvePostImageLayout({ className: "max-w-md" });
    expect(layout.imgClassName).toContain("max-w-md");
    expect(layout.imgClassName).not.toContain("max-w-xl");
  });

  it("prefers columnWidth over maxWidth", () => {
    const layout = resolvePostImageLayout({
      columnWidth: 0.5,
      maxWidth: "2xl",
    });
    expect(layout.wrapperStyle).toEqual({ width: "50%" });
    expect(layout.wrapperClassName).not.toContain("max-w-2xl");
  });

  it("forwards inline style to the image", () => {
    const layout = resolvePostImageLayout({
      style: { opacity: 0.5 },
    });
    expect(layout.imgStyle).toEqual({ opacity: 0.5 });
  });
});
