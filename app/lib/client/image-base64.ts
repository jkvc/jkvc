async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export async function filesToBase64(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => fileToBase64(file)));
}

export function base64ToDataUrl(base64: string, mime = "image/webp"): string {
  return `data:${mime};base64,${base64}`;
}
