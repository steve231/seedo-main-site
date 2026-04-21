import { Square, CheckSquare } from "lucide-react";
import { useState } from "react";

interface ChecklistItemProps {
  text: string;
  category?: string;
}

export function ChecklistItem({ text, category }: ChecklistItemProps) {
  const [checked, setChecked] = useState(false);

  return (
    <button
      onClick={() => setChecked(!checked)}
      className="flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-[#FF7A00] hover:shadow-sm"
    >
      {checked ? (
        <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
      ) : (
        <Square className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
      )}
      <div className="flex-1">
        {category && (
          <span className="mb-1 inline-block rounded bg-orange-100 px-2 py-0.5 text-[#FF7A00] text-xs font-medium">
            {category}
          </span>
        )}
        <p className={`text-sm ${checked ? "text-gray-500 line-through" : "text-gray-700"}`}>
          {text}
        </p>
      </div>
    </button>
  );
}
