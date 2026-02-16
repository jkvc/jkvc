/**
 * Test images available for quick testing without file uploads.
 * Drop images into public/test_images/ and add entries here.
 */

export interface TestImage {
  name: string;
  src: string;
}

export const TEST_IMAGES: TestImage[] = [
  { name: "mactree", src: "/test_images/mactree.jpg" },
  { name: "a", src: "/test_images/a.jpg" },
  { name: "b", src: "/test_images/b.jpg" },
  { name: "c", src: "/test_images/c.jpg" },
];
