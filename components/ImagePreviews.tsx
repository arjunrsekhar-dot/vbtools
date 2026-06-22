"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function FileImagePreviews({ files, remove }: { files: File[]; remove: (index: number) => void }) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  if (!files.length) return null;
  return <div className="image-preview-grid">{files.map((file, index) => <div key={`${file.name}-${file.lastModified}`}><img src={urls[index]} alt="" /><button type="button" aria-label={`Remove ${file.name}`} onClick={() => remove(index)}><X /></button><small>{file.name}</small></div>)}</div>;
}

export function StoredImagePreviews({ urls, remove }: { urls: string[]; remove: (index: number) => void }) {
  if (!urls.length) return null;
  return <div className="image-preview-grid">{urls.map((url, index) => <div key={url}><img src={url} alt={`Screenshot ${index + 1}`} /><button type="button" aria-label={`Remove screenshot ${index + 1}`} onClick={() => remove(index)}><X /></button><small>Screenshot {index + 1}</small></div>)}</div>;
}
