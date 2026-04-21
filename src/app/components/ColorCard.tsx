import { Check } from "lucide-react";
import { useState } from "react";

interface ColorCardProps {
  name: string;
  hex: string;
  rgb?: string;
  usage: string;
  textColor?: string;
}

export function ColorCard({ name, hex, rgb, usage, textColor = "text-white" }: ColorCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex h-32 cursor-pointer items-center justify-center transition-transform hover:scale-105 ${textColor}`}
        style={{ backgroundColor: hex }}
        onClick={copyToClipboard}
      >
        {copied ? (
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span className="font-medium">Copié !</span>
          </div>
        ) : (
          <div className="text-center">
            <div className="font-bold text-2xl">{name}</div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <div className="font-semibold text-gray-900 text-sm">{hex.toUpperCase()}</div>
          {rgb && <div className="text-gray-600 text-xs">{rgb}</div>}
        </div>
        <div className="text-gray-700 text-sm">{usage}</div>
      </div>
    </div>
  );
}
