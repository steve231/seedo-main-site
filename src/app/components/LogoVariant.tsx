interface LogoVariantProps {
  title: string;
  description: string;
  bgColor: string;
  children: React.ReactNode;
}

export function LogoVariant({ title, description, bgColor, children }: LogoVariantProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        className="flex h-48 items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {children}
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
