import { STATUS_LABELS, STATUS_COLORS } from '../../types/catering';

interface CateringStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function CateringStatusBadge({
  status,
  size = 'sm',
}: CateringStatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-800 text-gray-400 border-gray-700';
  const label = STATUS_LABELS[status] ?? status;
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClass} ${sizeClass} font-medium`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'PENDING'
            ? 'bg-yellow-500'
            : status === 'CONFIRMED'
            ? 'bg-blue-500'
            : status === 'DONE'
            ? 'bg-green-500'
            : 'bg-gray-500'
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
