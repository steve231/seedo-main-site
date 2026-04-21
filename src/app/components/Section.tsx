import { motion } from "motion/react";

interface SectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  bgColor?: string;
}

export function Section({ id, title, subtitle, children, bgColor = "bg-white" }: SectionProps) {
  return (
    <section id={id} className={`py-16 ${bgColor}`}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-3 font-bold text-3xl text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mb-8 text-gray-600 text-lg">{subtitle}</p>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
