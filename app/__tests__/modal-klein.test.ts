import { describe, expect, it } from "vitest";
import { buildKleinStreamPayload, KLEIN_ROUTE_PATH } from "@/app/lib/server/modal";
import { KLEIN_DEMO_NUM_STEPS, KLEIN_DEMO_RESOLUTION } from "@/app/lib/klein-demo";

describe("buildKleinStreamPayload", () => {
  it("builds t2i payload with defaults", () => {
    const payload = buildKleinStreamPayload({ prompt: " red square " });

    expect(payload.path).toBe(KLEIN_ROUTE_PATH);
    expect(payload.inputs).toMatchObject({
      prompt: "red square",
      resolution: KLEIN_DEMO_RESOLUTION,
      num_steps: KLEIN_DEMO_NUM_STEPS,
    });
    expect(typeof (payload.inputs as { seed: number }).seed).toBe("number");
    expect(payload.translator).toBeUndefined();
  });

  it("builds i2i payload with translator", () => {
    const payload = buildKleinStreamPayload({
      prompt: "make it blue",
      seed: 7,
      condImages: ["abc123", "def456"],
    });

    expect(payload.inputs).toMatchObject({
      prompt: "make it blue",
      seed: 7,
      cond_images: ["abc123", "def456"],
    });
    expect(payload.translator).toEqual({
      cond_images: "list_apply[imageb64_to_tensor]",
    });
  });

  it("rejects empty prompt", () => {
    expect(() => buildKleinStreamPayload({ prompt: "   " })).toThrow(
      "prompt is required",
    );
  });
});
