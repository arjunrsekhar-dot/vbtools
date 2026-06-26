export class InputValidationError extends Error {
  status = 422;
}

export function sanitizeText(value: string, max = 1000) {
  return value.normalize("NFKC").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

export function safeUrl(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new InputValidationError("Invalid URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new InputValidationError("Invalid URL scheme.");
  return parsed.toString();
}
