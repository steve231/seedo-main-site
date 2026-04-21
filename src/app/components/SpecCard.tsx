interface SpecCardProps {
  label: string;
  value: string;
  description?: string;
  color?: string;
}

export function SpecCard({ label, value, description, color = "#FF7A00" }: SpecCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-1 text-gray-600 text-xs uppercase tracking-wide">{label}</div>
      <div className="mb-2 font-bold text-2xl" style={{ color }}>
        {value}
      </div>
      {description && <div className="text-gray-600 text-sm">{description}</div>}
    </div>
  );
}
