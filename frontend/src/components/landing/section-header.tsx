export function SectionHeader({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-xl space-y-3">
      <p data-scramble className="font-mono text-xs text-muted">
        {eyebrow}
      </p>
      <h2 id={id} data-split className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[2rem]">
        {title}
      </h2>
      {children && (
        <p data-reveal className="text-pretty text-muted">
          {children}
        </p>
      )}
    </div>
  );
}
