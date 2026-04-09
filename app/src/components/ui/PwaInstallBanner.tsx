import { useEffect, useState, useCallback } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_KEY = 'amarktai_pwa_dismiss';
const DISMISS_DAYS = 30;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function wasDismissedRecently(): boolean {
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return false;
  const elapsed = Date.now() - Number(ts);
  return elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (wasDismissedRecently()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setDeferredPrompt(null);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-[#141720] border border-[#252A3A] rounded-xl shadow-2xl p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Install AmarktAI Marketing</p>
            <p className="text-[#5A6478] text-xs">For a better experience</p>
          </div>

          <button
            onClick={handleInstall}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Install
          </button>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-[#5A6478] hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
