import { motion } from "motion/react";
import { X, Check } from "lucide-react";

interface UsageItemProps {
  title: string;
  items: { text: string; correct: boolean }[];
}

export function UsageItem({ title, items }: UsageItemProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900 text-lg">{title}</h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3"
          >
            {item.correct ? (
              <Check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <X className="mt-1 h-5 w-5 shrink-0 text-red-600" />
            )}
            <span className={item.correct ? "text-gray-700" : "text-gray-500 line-through"}>
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
