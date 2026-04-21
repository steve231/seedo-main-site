import { Download, FileText, Image, Code, Palette } from "lucide-react";

type ResourceType = "document" | "image" | "code" | "design";

interface ResourceDownloadProps {
  title: string;
  description: string;
  type: ResourceType;
  size?: string;
  format?: string;
}

const iconMap = {
  document: FileText,
  image: Image,
  code: Code,
  design: Palette,
};

export function ResourceDownload({ title, description, type, size, format }: ResourceDownloadProps) {
  const Icon = iconMap[type];

  const handleDownload = () => {
    // Simulate download
    alert(`Téléchargement de ${title} - Format : ${format || "N/A"}`);
  };

  return (
    <button
      onClick={handleDownload}
      className="group flex w-full items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#FF7A00] hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-50 transition-colors group-hover:bg-[#FF7A00]">
        <Icon className="h-6 w-6 text-[#FF7A00] transition-colors group-hover:text-white" />
      </div>
      <div className="flex-1">
        <h4 className="mb-1 font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="mb-2 text-gray-600 text-xs">{description}</p>
        <div className="flex items-center gap-3 text-xs">
          {format && (
            <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
              {format}
            </span>
          )}
          {size && <span className="text-gray-500">{size}</span>}
        </div>
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        <Download className="h-5 w-5 text-gray-400 transition-colors group-hover:text-[#FF7A00]" />
      </div>
    </button>
  );
}
