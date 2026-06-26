import "server-only";

export const imageRules = {
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] },
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/webp": { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] }
} as const;

export async function validateImageUpload(file: File, maxSize: number) {
  const rule = imageRules[file.type as keyof typeof imageRules];
  if (!rule || file.size === 0 || file.size > maxSize) return null;
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!rule.signature.every((byte, index) => header[index] === byte)) return null;
  if (file.type === "image/webp" && String.fromCharCode(...header.slice(8, 12)) !== "WEBP") return null;
  return { extension: rule.extension };
}
