import { ReactNode } from "react";
import { Flower2 } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <Flower2 className="mb-4 text-rose" size={32} strokeWidth={1.25} />
      <h3 className="font-serif-display text-2xl text-charcoal">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-warmgray">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
