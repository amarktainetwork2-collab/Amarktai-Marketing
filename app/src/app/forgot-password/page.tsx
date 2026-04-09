import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Request failed');
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#06070A' }}>
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="bg-[#0D0F14]/80 backdrop-blur-xl border border-[#1A1F2E] rounded-2xl p-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-[#9AA3B8] hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>

          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-[#9AA3B8] text-sm">
                If an account with <span className="text-white">{email}</span> exists,
                we&apos;ve sent a password reset link.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Reset password</h2>
              </div>
              <p className="text-[#9AA3B8] text-sm mb-6">
                Enter the email address you used to register and we&apos;ll send you a link to reset your password.
              </p>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#0D0F14] border border-[#252A3A] rounded-xl px-4 py-3 text-white placeholder:text-[#5A6478] focus:outline-none focus:border-blue-600/60 transition-colors text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
