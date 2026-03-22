import { SignUp, useAuth } from '@clerk/clerk-react';
import { Link, Navigate } from 'react-router-dom';
import { Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkPubKey && clerkPubKey.startsWith('pk_');

function AuthenticatedRedirect({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RegisterContent() {
  const benefits = [
    'Autonomous AI content generation',
    'Cross-platform scheduling & publishing',
    'Real-time analytics & performance insights',
    'Lead capture and follow-up automation',
  ];

  return (
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
          Join businesses using AmarktAI Marketing to run autonomous AI-powered marketing across all channels.
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
              fallbackRedirectUrl="/dashboard"
            />
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <AlertTriangle className="w-6 h-6" style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Authentication not configured</p>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Set <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> in your environment to enable registration.
                </p>
              </div>
              <Link to="/">
                <Button variant="outline" size="sm" className="mt-2" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#CBD5E1' }}>
                  Back to home
                </Button>
              </Link>
            </div>
          )}
        </div>

        {isValidClerkKey && (
          <p className="text-center mt-6 text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,255,0.12) 0%, #06070A 60%)',
      }}
    >
      {isValidClerkKey ? (
        <AuthenticatedRedirect>
          <RegisterContent />
        </AuthenticatedRedirect>
      ) : (
        <RegisterContent />
      )}
    </div>
  );
}
