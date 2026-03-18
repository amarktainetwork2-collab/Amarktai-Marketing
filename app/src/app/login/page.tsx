import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

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
            <span className="text-xl font-bold text-white tracking-tight">Amarktai</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your Amarktai workspace</p>
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
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">
                Authentication is not configured for this environment.
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Set VITE_CLERK_PUBLISHABLE_KEY to enable sign-in.
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
