import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkPubKey && clerkPubKey.startsWith('pk_');

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,255,0.12) 0%, #06070A 60%)',
      }}
    >
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
          <p className="text-slate-400 text-sm">Sign in to your AmarktAI workspace</p>
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
              redirectUrl="/dashboard"
            />
          ) : (
            <div className="space-y-4">
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
                  Sign in
                </Button>
              </Link>
              <div className="text-center pt-2">
                <span className="text-xs" style={{ color: '#475569' }}>Preview mode active — full auth requires Clerk setup</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
