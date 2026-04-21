interface PhotoExampleProps {
  imageUrl: string;
  title: string;
  specs: string[];
  isCorrect: boolean;
}

export function PhotoExample({ imageUrl, title, specs, isCorrect }: PhotoExampleProps) {
  return (
    <div className={`overflow-hidden rounded-xl border-2 ${isCorrect ? "border-green-500" : "border-red-500"} bg-white shadow-sm`}>
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        <div className={`absolute top-3 right-3 rounded-full ${isCorrect ? "bg-green-600" : "bg-red-600"} px-3 py-1 font-semibold text-white text-xs`}>
          {isCorrect ? "✓ Bon exemple" : "✗ À éviter"}
        </div>
      </div>
      <div className="p-4">
        <h4 className="mb-3 font-semibold text-gray-900">{title}</h4>
        <ul className="space-y-2">
          {specs.map((spec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"></span>
              {spec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
