import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8 || password.length > 72) {
      setError('Password must be 8–72 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Reset failed');
      }
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06070A' }}>
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Invalid or missing reset link.</p>
          <Link to="/forgot-password" className="text-blue-500 hover:text-blue-400">
            Request a new one →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#06070A' }}>
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="bg-[#0D0F14]/80 backdrop-blur-xl border border-[#1A1F2E] rounded-2xl p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Password reset!</h2>
              <p className="text-[#9AA3B8] text-sm">
                Redirecting you to login…
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">New password</h2>
              </div>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (8–72 chars)"
                    className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-xl px-4 py-3 pr-12 text-white placeholder:text-[#5A6478] focus:outline-none focus:border-blue-600/60 transition-colors text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A6478]">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-xl px-4 py-3 text-white placeholder:text-[#5A6478] focus:outline-none focus:border-blue-600/60 transition-colors text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
