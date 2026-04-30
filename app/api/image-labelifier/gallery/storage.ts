// Storage namespace for Image Labelifier gallery. The string values still read
// `text-image:*` because they key existing Redis entries and Vercel Blob paths
// from before the project was renamed; flipping them would orphan stored
// gallery items. Keep the strings as opaque tokens.
export const IMAGE_LABELIFIER_GALLERY_NS = {
  galleryKey: "text-image:gallery",
  itemKeyPrefix: "text-image:item",
} as const;
