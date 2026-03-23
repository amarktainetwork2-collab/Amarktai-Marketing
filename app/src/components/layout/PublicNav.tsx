import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE_OUT_CURVE } from '@/lib/motion';
import { Zap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BG_NAV = 'rgba(5,7,11,0.88)';
const BORDER = 'rgba(255,255,255,0.08)';
const ACCENT = '#2563FF';
const CYAN = '#22D3EE';
const TEXT = '#F8FAFC';
const SUB = '#CBD5E1';
const SURFACE = '#0B1220';

const NAV_LINKS = [
  { label: 'Platform',     to: '/features' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Features',     to: '/features' },
  { label: 'Pricing',      to: '/pricing' },
];

interface Props {
  activePath?: string;
}

export default function PublicNav({ activePath = '' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT_CURVE }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: BG_NAV, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${CYAN} 100%)` }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold"><span style={{ color: '#F8FAFC' }}>Amarkt</span><span style={{ background: 'linear-gradient(90deg,#2563FF,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span><span style={{ color: '#F8FAFC' }}> Marketing</span></span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => {
              const isActive = activePath === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm font-medium transition-colors"
                  style={{ color: isActive ? TEXT : SUB }}
                  onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={e => (e.currentTarget.style.color = isActive ? TEXT : SUB)}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm" style={{ color: SUB }}>Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="text-sm font-semibold" style={{ background: ACCENT, color: '#fff' }}>
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: SUB }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden"
          style={{ background: SURFACE, borderTop: `1px solid ${BORDER}` }}
        >
          <div className="px-4 py-5 space-y-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block text-sm font-medium py-1"
                style={{ color: activePath === l.to ? TEXT : SUB }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t" style={{ borderColor: BORDER }}>
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full" style={{ color: SUB }}>Login</Button>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button className="w-full font-semibold" style={{ background: ACCENT, color: '#fff' }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
