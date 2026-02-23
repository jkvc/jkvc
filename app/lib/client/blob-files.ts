export async function fetchAsFile(
  url: string,
  filename: string,
  fallbackType?: string
): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch asset: ${filename}`);
  }
  const blob = await res.blob();
  const type = blob.type || fallbackType || "application/octet-stream";
  return new File([blob], filename, { type });
}

export function appendJsonFile(
  formData: FormData,
  fieldName: string,
  filename: string,
  payload: unknown
) {
  formData.append(
    fieldName,
    new File([JSON.stringify(payload)], filename, { type: "application/json" })
  );
}
