interface ApplicationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  specs: string[];
}

export function ApplicationCard({ icon, title, description, specs }: ApplicationCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-orange-100 p-3">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-gray-900 text-lg">{title}</h3>
      <p className="mb-4 text-gray-600 text-sm">{description}</p>
      <ul className="space-y-2">
        {specs.map((spec, idx) => (
          <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"></span>
            {spec}
          </li>
        ))}
      </ul>
    </div>
  );
}
