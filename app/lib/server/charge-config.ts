export interface ChargePool {
  /** Full descriptive ID, e.g. "photo-commentator-comment". */
  id: string;
  /** Human display name for the dashboard. */
  label: string;
  /** Grouping key for dashboard sections. */
  demo: string;
  /** API route path this pool meters. */
  route: string;
  /** Maximum accumulated charges. */
  maxCharges: number;
  /** Hours per 1 charge recharge. */
  rechargeIntervalHours: number;
}

export const CHARGE_POOLS: ChargePool[] = [
  {
    id: "photo-commentator-comment",
    demo: "Photo Commentator",
    label: "Comment",
    route: "/api/photo-commentator/comment",
    maxCharges: 10,
    rechargeIntervalHours: 1,
  },
  {
    id: "photo-commentator-theme",
    demo: "Photo Commentator",
    label: "Theme",
    route: "/api/photo-commentator/theme",
    maxCharges: 10,
    rechargeIntervalHours: 1,
  },
  {
    id: "image-reconstructor-generate-prompt",
    demo: "Image Reconstructor",
    label: "Prompt",
    route: "/api/image-reconstructor/generate-prompt",
    maxCharges: 20,
    rechargeIntervalHours: 0.5,
  },
  {
    id: "image-reconstructor-sketch",
    demo: "Image Reconstructor",
    label: "Sketch",
    route: "/api/image-reconstructor/sketch",
    maxCharges: 5,
    rechargeIntervalHours: 2,
  },
  {
    id: "image-reconstructor-animate",
    demo: "Image Reconstructor",
    label: "Animate",
    route: "/api/image-reconstructor/animate",
    maxCharges: 3,
    rechargeIntervalHours: 4,
  },
  {
    id: "image-labelifier-segmentation",
    demo: "Image Labelifier",
    label: "Segment",
    route: "/api/image-labelifier/segmentation",
    maxCharges: 15,
    rechargeIntervalHours: 0.5,
  },
  {
    id: "image-labelifier-depth",
    demo: "Image Labelifier",
    label: "Depth",
    route: "/api/image-labelifier/depth",
    maxCharges: 15,
    rechargeIntervalHours: 0.5,
  },
];

export function getPool(poolId: string): ChargePool | undefined {
  return CHARGE_POOLS.find((p) => p.id === poolId);
}
