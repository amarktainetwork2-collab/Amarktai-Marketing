import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, TrendingUp, Clock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const BENEFITS = [
  { icon: TrendingUp, text: 'AI-generated content across 15+ platforms' },
  { icon: Clock, text: 'Fully autonomous — works while you sleep' },
  { icon: Shield, text: 'Secure JWT auth — your data stays yours' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070A] flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0D0F14] border-r border-[#1E2130] p-12">
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
              Marketing that never sleeps.
            </h2>
            <p className="text-[#9AA3B8] text-lg mb-10">
              Your AI team is already working.
            </p>
            <ul className="space-y-5">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-[#9AA3B8] text-sm">{b.text}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>

        {/* Abstract visual */}
        <div className="rounded-2xl bg-[#141720] border border-[#252A3A] p-6 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }}
          />
          <p className="text-[#5A6478] text-xs uppercase tracking-widest mb-3">Live activity</p>
          <div className="space-y-2">
            {[
              { platform: 'LinkedIn', action: 'Posted thought leadership', time: '2m ago' },
              { platform: 'Twitter/X', action: 'Scheduled 3 tweets', time: '5m ago' },
              { platform: 'Instagram', action: 'Generating reel script', time: 'Just now' },
            ].map((item) => (
              <div key={item.platform} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-white text-xs font-medium">{item.platform}</span>
                  <span className="text-[#5A6478] text-xs">{item.action}</span>
                </div>
                <span className="text-[#5A6478] text-xs">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
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

          <h1 className="text-white font-bold text-3xl mb-2">Welcome back</h1>
          <p className="text-[#9AA3B8] mb-8">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#9AA3B8] text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-xl px-4 py-3 text-white placeholder:text-[#5A6478] focus:outline-none focus:border-blue-600/60 transition-colors text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[#9AA3B8] text-sm font-medium">Password</label>
                <button type="button" className="text-blue-500 hover:text-blue-400 text-xs transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-[#9AA3B8] text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
              Start free →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
