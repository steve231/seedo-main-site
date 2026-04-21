import { X, Check } from "lucide-react";

interface ExampleComparisonProps {
  title: string;
  wrongExample: {
    image?: string;
    text: string;
  };
  correctExample: {
    image?: string;
    text: string;
  };
}

export function ExampleComparison({ title, wrongExample, correctExample }: ExampleComparisonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="grid md:grid-cols-2">
        {/* Wrong Example */}
        <div className="border-r border-gray-200 p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
              <X className="h-4 w-4 text-red-600" />
            </div>
            <span className="font-semibold text-red-700 text-sm">À ne pas faire</span>
          </div>
          {wrongExample.image && (
            <div className="mb-3 overflow-hidden rounded-lg bg-gray-100 p-4">
              {wrongExample.image}
            </div>
          )}
          <p className="text-gray-600 text-sm">{wrongExample.text}</p>
        </div>

        {/* Correct Example */}
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-semibold text-green-700 text-sm">À faire</span>
          </div>
          {correctExample.image && (
            <div className="mb-3 overflow-hidden rounded-lg bg-gray-100 p-4">
              {correctExample.image}
            </div>
          )}
          <p className="text-gray-600 text-sm">{correctExample.text}</p>
        </div>
      </div>
    </div>
  );
}
