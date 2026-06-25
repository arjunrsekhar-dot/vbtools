export default function Loading() {
  return (
    <div className="page-loading" role="status" aria-live="polite" aria-label="Loading page">
      <span className="loading-mark" />
      <span className="loading-bar" />
    </div>
  );
}
