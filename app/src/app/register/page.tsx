import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

const benefits = [
  'Autonomous AI content generation',
  'Cross-platform scheduling & publishing',
  'Real-time analytics & performance insights',
  'Lead capture and follow-up automation',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name || undefined);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,255,0.14) 0%, #06070A 60%)',
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
            <span className="text-xl font-bold tracking-tight">
              <span style={{ color: '#F8FAFC' }}>Amarkt</span>
              <span
                style={{
                  background: 'linear-gradient(90deg,#2563FF,#22D3EE)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI
              </span>
              <span style={{ color: '#F8FAFC' }}> Marketing</span>
            </span>
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

        {/* Right: Register form */}
        <div>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563FF 0%, #22D3EE 100%)' }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span style={{ color: '#F8FAFC' }}>Amarkt</span>
                <span
                  style={{
                    background: 'linear-gradient(90deg,#2563FF,#22D3EE)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  AI
                </span>
                <span style={{ color: '#F8FAFC' }}> Marketing</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-slate-400 text-sm">Start free — no credit card required</p>
          </div>

          <div
            className="rounded-2xl p-7 border"
            style={{
              background: 'rgba(17, 24, 39, 0.75)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.10)',
              boxShadow: '0 0 0 1px rgba(37,99,255,0.08), 0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 mb-5 text-sm"
                style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)', color: '#FCA5A5' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="name">
                  Full name <span className="text-slate-500 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: '#F8FAFC',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(37,99,255,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: '#F8FAFC',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(37,99,255,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-lg px-3.5 py-2.5 pr-10 text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: '#F8FAFC',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(37,99,255,0.6)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-xs mt-1" style={{ color: '#F59E0B' }}>
                    Password must be at least 8 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-semibold mt-2"
                disabled={loading}
                style={{ background: '#2563FF', color: '#fff' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  'Create account'
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center leading-relaxed">
                By creating an account you agree to our{' '}
                <Link to="/terms" className="text-slate-400 hover:text-slate-300 underline">Terms</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-slate-400 hover:text-slate-300 underline">Privacy Policy</Link>.
              </p>
            </form>
          </div>

          <p className="text-center mt-6 text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
