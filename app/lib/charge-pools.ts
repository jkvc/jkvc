import type { ChargePoolConfig } from "next-charge";

export const CHARGE_POOLS: ChargePoolConfig[] = [
  {
    id: "photo-commentator-comment",
    group: "Photo Commentator",
    label: "Comment",
    maxCharges: 10,
    rechargeIntervalHours: 1,
  },
  {
    id: "photo-commentator-theme",
    group: "Photo Commentator",
    label: "Theme",
    maxCharges: 10,
    rechargeIntervalHours: 1,
  },
  {
    id: "image-reconstructor-generate-prompt",
    group: "Image Reconstructor",
    label: "Prompt",
    maxCharges: 20,
    rechargeIntervalHours: 0.5,
  },
  {
    id: "image-reconstructor-sketch",
    group: "Image Reconstructor",
    label: "Sketch",
    maxCharges: 5,
    rechargeIntervalHours: 2,
  },
  {
    id: "image-reconstructor-animate",
    group: "Image Reconstructor",
    label: "Animate",
    maxCharges: 3,
    rechargeIntervalHours: 4,
  },
  {
    id: "image-labelifier-segmentation",
    group: "Image Labelifier",
    label: "Segment",
    maxCharges: 15,
    rechargeIntervalHours: 0.5,
  },
  {
    id: "image-labelifier-depth",
    group: "Image Labelifier",
    label: "Depth",
    maxCharges: 15,
    rechargeIntervalHours: 0.5,
  },
];
