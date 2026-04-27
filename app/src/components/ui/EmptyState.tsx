import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  ctaText,
  ctaHref,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-[#0D0F14]/80 border border-[#1A1F2E] rounded-2xl p-10 flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#1E2130] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#5A6478]" />
      </div>

      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      <p className="text-[#5A6478] text-sm max-w-sm">{description}</p>

      {ctaText && ctaHref && (
        <Link
          to={ctaHref}
          className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {ctaText}
        </Link>
      )}
    </motion.div>
  );
}
