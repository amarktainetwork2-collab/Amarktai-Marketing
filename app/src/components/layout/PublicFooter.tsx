import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0D0F14] border-t border-[#1E2130]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">
                <span className="whitespace-nowrap">Amarkt<span className="text-blue-500">AI</span></span> Marketing
              </span>
            </Link>
            <p className="text-[#5A6478] text-sm leading-relaxed">
              Autonomous AI marketing at scale.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {[
                { label: 'Features', href: '/features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-[#5A6478] hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {[
                { label: 'About', href: '/about' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-[#5A6478] hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-[#5A6478] hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1E2130] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#5A6478] text-sm">
            © {year} <span className="whitespace-nowrap">Amarkt<span className="text-blue-500">AI</span></span> Marketing. All rights reserved.
          </p>
          <p className="text-[#5A6478] text-xs">
            Part of{' '}
            <a
              href="https://amarktai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              <span className="whitespace-nowrap">Amarkt<span className="text-blue-300">AI</span></span> Network
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
