import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkPubKey && clerkPubKey.startsWith('pk_');

export default function RegisterPage() {
  const benefits = [
    'Autonomous AI content generation',
    'Cross-platform scheduling & publishing',
    'Real-time analytics & performance insights',
    'Lead capture and follow-up automation',
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,255,0.12) 0%, #06070A 60%)',
      }}
    >
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Value prop */}
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563FF 0%, #22D3EE 100%)' }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight"><span style={{ color: '#F8FAFC' }}>Amarkt</span><span style={{ background: 'linear-gradient(90deg,#2563FF,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span><span style={{ color: '#F8FAFC' }}> Marketing</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            Automate your marketing.<br />
            <span style={{ color: '#22D3EE' }}>Scale without limits.</span>
          </h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Join businesses using AmarktAI to run autonomous AI-powered marketing across all channels.
          </p>
          <ul className="space-y-3">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#10B981' }} />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Sign up */}
        <div>
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563FF 0%, #22D3EE 100%)' }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight"><span style={{ color: '#F8FAFC' }}>Amarkt</span><span style={{ background: 'linear-gradient(90deg,#2563FF,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span></span>
            </Link>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-slate-400 text-sm">Start free — no credit card required</p>
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{
              background: 'rgba(17, 24, 39, 0.72)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.10)',
              boxShadow: '0 0 0 1px rgba(37,99,255,0.08), 0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            {isValidClerkKey ? (
              <SignUp
                routing="path"
                path="/register"
                signInUrl="/login"
                redirectUrl="/dashboard"
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#CBD5E1' }}>Full name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none border"
                    style={{
                      background: 'rgba(15,23,42,0.8)',
                      borderColor: 'rgba(255,255,255,0.12)',
                      color: '#F8FAFC',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#CBD5E1' }}>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none border"
                    style={{
                      background: 'rgba(15,23,42,0.8)',
                      borderColor: 'rgba(255,255,255,0.12)',
                      color: '#F8FAFC',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#CBD5E1' }}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none border"
                    style={{
                      background: 'rgba(15,23,42,0.8)',
                      borderColor: 'rgba(255,255,255,0.12)',
                      color: '#F8FAFC',
                    }}
                  />
                </div>
                <Link to="/dashboard" className="block w-full">
                  <Button className="w-full font-semibold py-3" style={{ background: '#2563FF', color: '#fff' }}>
                    Create account
                  </Button>
                </Link>
                <div className="text-center pt-2">
                  <span className="text-xs" style={{ color: '#475569' }}>Preview mode active — full auth requires Clerk setup</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-center mt-6 text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
