import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BG = '#05070B';
const SURFACE = '#0B1220';
const BORDER = 'rgba(255,255,255,0.08)';
const ACCENT = '#2563FF';
const CYAN = '#22D3EE';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const SUB = '#CBD5E1';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4" style={{ color: TEXT }}>{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: SUB }}>
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  const updated = 'January 1, 2025';

  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(5,7,11,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${CYAN} 100%)` }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold"><span style={{ color: '#F8FAFC' }}>Amarkt</span><span style={{ background: 'linear-gradient(90deg,#2563FF,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" className="text-sm" style={{ color: MUTED }}>Login</Button></Link>
            <Link to="/register">
              <Button size="sm" className="text-sm font-semibold" style={{ background: ACCENT, color: '#fff' }}>Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <p className="text-xs font-medium mb-3" style={{ color: MUTED }}>Effective Date: {updated}</p>
            <h1 className="text-4xl font-bold mb-4" style={{ color: TEXT }}>Privacy Policy</h1>
            <p className="text-base leading-relaxed" style={{ color: SUB }}>
              AmarktAI Marketing ("we", "our", or "us") is operated by AmarktAI Network. This Privacy Policy
              explains what data we collect, how we use it, and your rights as a user of marketing.amarktai.com.
            </p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>

            <Section title="1. Data We Collect">
              <p><strong style={{ color: TEXT }}>Account data.</strong> When you register, we collect your name, email address, and any profile information you provide. Passwords are hashed using bcrypt and never stored in plaintext.</p>
              <p><strong style={{ color: TEXT }}>Platform connection data.</strong> When you connect social media accounts (e.g. Instagram, YouTube, TikTok), we store OAuth tokens necessary to publish content on your behalf. We access only the permissions you explicitly grant.</p>
              <p><strong style={{ color: TEXT }}>Business and content data.</strong> We store information about the businesses you add to the platform (name, URL, description) and the AI-generated content associated with them.</p>
              <p><strong style={{ color: TEXT }}>Usage data.</strong> We collect anonymised data about how you use the platform — pages visited, features used, and errors encountered. This is used solely for product improvement.</p>
              <p><strong style={{ color: TEXT }}>Analytics and performance data.</strong> We receive performance metrics (views, likes, comments, clicks) from connected social platforms to power analytics features.</p>
              <p><strong style={{ color: TEXT }}>Payment data.</strong> Billing is handled by a third-party payment processor. We do not store payment card details.</p>
              <p><strong style={{ color: TEXT }}>Cookies.</strong> We use essential cookies for authentication session management and, where you consent, analytics cookies to understand platform usage.</p>
            </Section>

            <Section title="2. How We Use Your Data">
              <p>We use your data to: provide and maintain the AmarktAI Marketing service; generate AI content on your behalf; publish content to connected platforms; send service-critical communications (account confirmations, billing alerts); improve and debug the platform; and comply with legal obligations.</p>
              <p>We do not sell your data. We do not use your content or account data to train AI models for third-party commercial purposes.</p>
            </Section>

            <Section title="3. Data Sharing">
              <p>We share data with trusted third-party service providers only as necessary to operate the platform. These include: cloud infrastructure providers, payment processors, and AI inference services. All processors operate under data processing agreements and are prohibited from using your data for any purpose other than providing services to us.</p>
              <p>We may disclose data if required to do so by law or valid legal process.</p>
            </Section>

            <Section title="4. Data Retention">
              <p>We retain your account and content data for as long as your account is active. If you delete your account, we will permanently delete your personal data within 30 days, except where retention is required by law.</p>
              <p>Platform OAuth tokens are deleted immediately when you disconnect a social account.</p>
            </Section>

            <Section title="5. Security">
              <p>We use industry-standard security measures including encrypted data storage, TLS in transit, and access controls. OAuth tokens are stored encrypted at rest. No security measure is perfect, but we take the protection of your data seriously and maintain a security incident response process.</p>
            </Section>

            <Section title="6. Your Rights">
              <p>Depending on your location, you may have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; object to or restrict certain processing; and data portability.</p>
              <p>To exercise any of these rights, contact us at privacy@amarktai.com. We will respond within 30 days.</p>
            </Section>

            <Section title="7. Cookies and Tracking">
              <p>We use session cookies for authentication and, with your consent, analytics cookies to understand how the platform is used. You can control cookie preferences through your browser settings. Disabling cookies may affect your ability to use certain features.</p>
            </Section>

            <Section title="8. Third-Party Links">
              <p>The platform may contain links to external websites (e.g. AmarktAI.com). These are governed by their own privacy policies. We are not responsible for the privacy practices of third-party websites.</p>
            </Section>

            <Section title="9. Children">
              <p>AmarktAI Marketing is not intended for users under the age of 16. We do not knowingly collect data from children. If you believe a child has provided us with personal data, contact us and we will delete it promptly.</p>
            </Section>

            <Section title="10. Changes to This Policy">
              <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or via an in-platform notification. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
            </Section>

            <Section title="11. Contact">
              <p>
                For privacy-related queries: <strong style={{ color: TEXT }}>amarktainetwork@gmail.com</strong>
              </p>
              <p>
                AmarktAI Network · marketing.amarktai.com
              </p>
            </Section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-10" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: MUTED }}>
          <p>© {new Date().getFullYear()} AmarktAI Marketing. Part of <a href="https://amarktai.com" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>AmarktAI Network</a>.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:underline" style={{ color: MUTED }}>Privacy</Link>
            <Link to="/terms" className="hover:underline" style={{ color: MUTED }}>Terms</Link>
            <Link to="/contact" className="hover:underline" style={{ color: MUTED }}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
