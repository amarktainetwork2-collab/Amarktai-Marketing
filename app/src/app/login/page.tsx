import { SignIn, useAuth } from '@clerk/clerk-react';
import { Link, Navigate } from 'react-router-dom';
import { Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkPubKey && clerkPubKey.startsWith('pk_');

function AuthenticatedRedirect({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (isLoaded && isSignedIn) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function LoginContent() {
  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563FF 0%, #22D3EE 100%)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight"><span style={{ color: '#F8FAFC' }}>Amarkt</span><span style={{ background: 'linear-gradient(90deg,#2563FF,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span></span>
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-slate-400 text-sm">Sign in to your AmarktAI Marketing workspace</p>
      </div>

      {/* Auth Card */}
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
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
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
                Set <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> in your environment to enable sign in.
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
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Create account
          </Link>
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,255,0.12) 0%, #06070A 60%)',
      }}
    >
      {isValidClerkKey ? (
        <AuthenticatedRedirect>
          <LoginContent />
        </AuthenticatedRedirect>
      ) : (
        <LoginContent />
      )}
    </div>
  );
}
