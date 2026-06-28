/** Resize so the longest edge is at most `maxEdge` px (aspect preserved). */
export function resizeFileToLongestEdge(file: File, maxEdge: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { naturalWidth: w, naturalHeight: h } = img;
      const longest = Math.max(w, h);
      if (longest <= maxEdge) {
        resolve(file);
        return;
      }

      const scale = maxEdge / longest;
      const nw = Math.max(1, Math.round(w * scale));
      const nh = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement("canvas");
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, nw, nh);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Resize failed"));
            return;
          }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}

export async function resizeFilesToLongestEdge(
  files: File[],
  maxEdge: number,
): Promise<File[]> {
  return Promise.all(files.map((file) => resizeFileToLongestEdge(file, maxEdge)));
}
