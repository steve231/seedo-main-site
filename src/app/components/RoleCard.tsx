import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  resources: string[];
  onClick: () => void;
}

export function RoleCard({ icon: Icon, title, description, resources, onClick }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border-2 border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:scale-105 hover:border-[#FF7A00] hover:shadow-lg"
    >
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-orange-100 p-3 transition-colors group-hover:bg-[#FF7A00]">
        <Icon className="h-8 w-8 text-[#FF7A00] transition-colors group-hover:text-white" />
      </div>
      <h3 className="mb-2 font-bold text-gray-900 text-xl transition-colors group-hover:text-[#FF7A00]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {title}
      </h3>
      <p className="mb-4 text-gray-600 text-sm">{description}</p>
      <div className="space-y-1">
        <p className="mb-2 font-semibold text-gray-700 text-xs uppercase tracking-wide">Ressources :</p>
        {resources.map((resource, idx) => (
          <div key={idx} className="flex items-center gap-2 text-gray-600 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
            {resource}
          </div>
        ))}
      </div>
    </button>
  );
}
