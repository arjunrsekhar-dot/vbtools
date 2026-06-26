"use client";

import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/components/AppProvider";

export function Logo({ compact = false }: { compact?: boolean }) {
  const { branding } = useApp();
  return (
    <Link href="/" className="brand" aria-label="Voltbean Tools home">
      {branding.logoUrl ? (
        <span className="brand-uploaded-mark" aria-hidden="true">
          <Image src={branding.logoUrl} alt="" width={150} height={38} unoptimized />
        </span>
      ) : (
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-bean" />
          <span className="brand-bolt">ϟ</span>
        </span>
      )}
      {!compact && !branding.logoUrl && (
        <span className="brand-name">
          voltbean<span>tools</span>
        </span>
      )}
    </Link>
  );
}
