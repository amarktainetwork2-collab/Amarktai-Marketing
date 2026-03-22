import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const BORDER = 'rgba(255,255,255,0.08)';
const ACCENT = '#2563FF';
const CYAN = '#22D3EE';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';

export default function PublicFooter() {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-16" style={{ borderTop: `1px solid ${BORDER}` }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${CYAN} 100%)` }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold"><span style={{ color: '#F8FAFC' }}>Amarkt</span><span style={{ background: 'linear-gradient(90deg,#2563FF,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span><span style={{ color: '#F8FAFC' }}> Marketing</span></span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              Autonomous AI social media marketing.<br />Part of the AmarktAI Network.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Product</h4>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-sm hover:underline" style={{ color: MUTED }}>Features</Link></li>
              <li><Link to="/pricing" className="text-sm hover:underline" style={{ color: MUTED }}>Pricing</Link></li>
              <li><Link to="/register" className="text-sm hover:underline" style={{ color: MUTED }}>Start Free Trial</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm hover:underline" style={{ color: MUTED }}>About Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:underline" style={{ color: MUTED }}>Contact Us</Link></li>
              <li>
                <a href="https://amarktai.com" target="_blank" rel="noopener noreferrer"
                  className="text-sm hover:underline" style={{ color: MUTED }}>
                  AmarktAI Network ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-sm hover:underline" style={{ color: MUTED }}>Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:underline" style={{ color: MUTED }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
          style={{ borderTop: `1px solid ${BORDER}`, color: MUTED }}>
          <p>© {new Date().getFullYear()} AmarktAI Marketing · Part of <a href="https://amarktai.com" target="_blank" rel="noopener noreferrer" className="hover:underline">AmarktAI Network</a></p>
          <a href="https://amarktai.com" target="_blank" rel="noopener noreferrer"
            className="hover:underline" style={{ color: MUTED }}>amarktai.com</a>
        </div>
      </div>
    </footer>
  );
}
