import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="Voltbean Tools home">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-bean" />
        <span className="brand-bolt">ϟ</span>
      </span>
      {!compact && (
        <span className="brand-name">
          voltbean<span>tools</span>
        </span>
      )}
    </Link>
  );
}
