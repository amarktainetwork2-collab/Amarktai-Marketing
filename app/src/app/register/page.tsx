import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { PLATFORM_COUNT_PLUS } from '@/lib/platformConstants';
import ParticleBackground from '@/components/ui/ParticleBackground';

const BENEFITS = [
  `AI content generation across ${PLATFORM_COUNT_PLUS} platforms`,
  'Smart scheduling with engagement optimization',
  'Viral predictor + A/B testing built in',
  'No credit card required to start',
];

function PasswordStrength({ password }: { password: string }) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-400'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-[#252A3A]'}`} />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-yellow-400' : score === 3 ? 'text-blue-400' : 'text-emerald-400'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password.length > 72) {
      setError('Password must be 72 characters or fewer.');
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070A] flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0D0F14] border-r border-[#1E2130] p-12 relative overflow-hidden">
        <ParticleBackground variant="network" opacity={0.25} />
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">
            <span className="whitespace-nowrap">Amarkt<span className="text-blue-500">AI</span></span> Marketing
          </span>
        </Link>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              Start building your AI marketing machine.
            </h2>
            <p className="text-[#9AA3B8] text-lg mb-10">
              Free trial. No credit card. Full access.
            </p>
            <div className="space-y-4">
              <p className="text-[#5A6478] text-xs uppercase tracking-widest font-semibold">What you get free:</p>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-[#9AA3B8] text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Abstract AI visual */}
        <div
          className="rounded-2xl border border-[#252A3A] p-8 relative overflow-hidden flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0D0F14 0%, #141720 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
          />
          <div className="relative text-center">
            <div className="text-6xl font-black mb-2" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI
            </div>
            <p className="text-[#5A6478] text-xs">Marketing that works around the clock</p>
          </div>
        </div>
      </div>

      {/* Right: Register form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              <span className="whitespace-nowrap">Amarkt<span className="text-blue-500">AI</span></span> Marketing
            </span>
          </Link>

          <h1 className="text-white font-bold text-3xl mb-2">Create your account</h1>
          <p className="text-[#9AA3B8] mb-8">7-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#9AA3B8] text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
                className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-xl px-4 py-3 text-white placeholder:text-[#5A6478] focus:outline-none focus:border-blue-600/60 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-[#9AA3B8] text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-xl px-4 py-3 text-white placeholder:text-[#5A6478] focus:outline-none focus:border-blue-600/60 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-[#9AA3B8] text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-xl px-4 py-3 pr-12 text-white placeholder:text-[#5A6478] focus:outline-none focus:border-blue-600/60 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A6478] hover:text-[#9AA3B8] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label className="block text-[#9AA3B8] text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Re-enter password"
                className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-xl px-4 py-3 text-white placeholder:text-[#5A6478] focus:outline-none focus:border-blue-600/60 transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Start free trial'
              )}
            </button>
          </form>

          <p className="text-center text-[#5A6478] text-xs mt-6">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-blue-500 hover:text-blue-400 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-500 hover:text-blue-400 transition-colors">Privacy Policy</Link>.
          </p>

          <p className="text-center text-[#9AA3B8] text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
              Sign in →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
