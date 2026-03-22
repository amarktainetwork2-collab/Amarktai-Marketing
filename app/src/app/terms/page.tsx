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

export default function TermsPage() {
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
            <span className="font-bold"><span style={{ color: '#F8FAFC' }}>Amarkt</span><span style={{ background: 'linear-gradient(90deg,#2563FF,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ai</span></span>
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
            <h1 className="text-4xl font-bold mb-4" style={{ color: TEXT }}>Terms of Service</h1>
            <p className="text-base leading-relaxed" style={{ color: SUB }}>
              These Terms of Service ("Terms") govern your use of Amarktai Marketing, operated by Amarktai Network
              at marketing.amarktai.com. By registering an account or using the service, you agree to these Terms.
            </p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>

            <Section title="1. Account Registration and Usage">
              <p>You must be at least 16 years old to create an account. You are responsible for maintaining the security of your account credentials. You must not share your credentials with others or use another person's account without authorisation.</p>
              <p>You agree to provide accurate account information and to keep it up to date. Amarktai Network reserves the right to suspend or terminate accounts that provide false information or violate these Terms.</p>
            </Section>

            <Section title="2. Acceptable Use">
              <p>You may use Amarktai Marketing only for lawful marketing purposes. You must not use the service to: generate spam, misinformation, or deceptive content; publish content that is illegal, abusive, or harmful; attempt to gain unauthorised access to the platform or its infrastructure; scrape or extract data in an automated manner beyond normal platform use; or resell or sublicense access to the service without our written consent.</p>
              <p>Content published through the platform is your responsibility. You must comply with the terms of service of each social platform you connect (YouTube, Instagram, TikTok, etc.).</p>
            </Section>

            <Section title="3. Free Trial and Billing">
              <p><strong style={{ color: TEXT }}>7-day free trial.</strong> All plans begin with a 7-day free trial. No credit card is required to start a trial. After the trial period, continued access requires an active paid subscription.</p>
              <p><strong style={{ color: TEXT }}>Subscriptions.</strong> Subscriptions are billed monthly in advance. Prices are displayed at marketing.amarktai.com/pricing and are subject to change with 30 days' notice.</p>
              <p><strong style={{ color: TEXT }}>Cancellation.</strong> You may cancel at any time from your account settings. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial billing periods.</p>
              <p><strong style={{ color: TEXT }}>Paused accounts.</strong> If a trial expires without a subscription, your account is paused. Your data is retained for 30 days before permanent deletion.</p>
            </Section>

            <Section title="4. Platform Integrations">
              <p>Amarktai Marketing connects to third-party social platforms via OAuth. We act as your authorised publisher when posting content. You may revoke our access at any time from your connected accounts settings, or directly from each platform's own security settings.</p>
              <p>We are not responsible for outages, policy changes, or access revocations on third-party platforms that affect the service.</p>
            </Section>

            <Section title="5. Intellectual Property">
              <p>You retain ownership of all content you create, add to, or publish through Amarktai Marketing. By using the platform, you grant us a limited licence to process, store, and transmit your content solely for the purpose of providing the service.</p>
              <p>Amarktai Marketing, its design, codebase, and AI models are the exclusive property of Amarktai Network. You may not copy, modify, or distribute any part of the platform without our written consent.</p>
            </Section>

            <Section title="6. AI-Generated Content">
              <p>Content generated by our AI is provided as a starting point. You are responsible for reviewing, approving, and ensuring compliance of any content before it is published. Amarktai Network does not guarantee the accuracy, originality, or appropriateness of AI-generated content.</p>
            </Section>

            <Section title="7. Service Availability">
              <p>We aim to provide a reliable service but do not guarantee 100% uptime. Scheduled maintenance, infrastructure incidents, or third-party outages may cause temporary interruptions. We will communicate planned downtime in advance where possible.</p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>To the fullest extent permitted by law, Amarktai Network shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including loss of revenue, data, or business opportunity.</p>
              <p>Our total liability for any claim shall not exceed the amount you paid to us in the 3 months preceding the event giving rise to the claim.</p>
            </Section>

            <Section title="9. Termination">
              <p>We reserve the right to suspend or terminate your account immediately if you breach these Terms, engage in fraudulent activity, or use the service in a way that harms other users or the platform's integrity.</p>
              <p>Upon termination, your access will be revoked immediately. Your data will be retained for 30 days and then permanently deleted, unless required by law.</p>
            </Section>

            <Section title="10. Changes to These Terms">
              <p>We may update these Terms from time to time. Material changes will be communicated by email or via an in-platform notification at least 14 days before they take effect. Continued use of the service after changes constitutes acceptance.</p>
            </Section>

            <Section title="11. Governing Law">
              <p>These Terms are governed by the laws of the jurisdiction in which Amarktai Network operates. Any disputes shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.</p>
            </Section>

            <Section title="12. Contact">
              <p>
                For legal or terms-related queries: <strong style={{ color: TEXT }}>amarktainetwork@gmail.com</strong>
              </p>
              <p>
                Amarktai Network · marketing.amarktai.com
              </p>
            </Section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-10" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: MUTED }}>
          <p>© {new Date().getFullYear()} Amarktai Marketing. Part of Amarktai Network.</p>
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
