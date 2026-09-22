import { useState } from "react";

interface RawJsonProps {
  title: string;
  value: unknown;
  defaultOpen?: boolean;
}

export function RawJson({ title, value, defaultOpen = false }: RawJsonProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details className="raw-json" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{title}</summary>
      <pre aria-label={title}>{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}
