import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Share2, PlusSquare, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallPromptProps {
  primaryColor?: string;
  isOpenManual?: boolean;
  onCloseManual?: () => void;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  primaryColor = '#781D32',
  isOpenManual = false,
  onCloseManual,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();
    if (standalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // Listen for BeforeInstallPromptEvent (Android & Desktop Chromium)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const hasDismissed = localStorage.getItem('nrityasana_pwa_dismissed');
      if (!hasDismissed) {
        setIsBannerVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not dismissed, show prompt after a short delay
    if (isIosDevice) {
      const hasDismissed = localStorage.getItem('nrityasana_pwa_dismissed');
      if (!hasDismissed) {
        const timer = setTimeout(() => setIsBannerVisible(true), 3500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Sync manual trigger
  useEffect(() => {
    if (isOpenManual) {
      setIsModalOpen(true);
    }
  }, [isOpenManual]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        setIsBannerVisible(false);
        setTimeout(() => setIsModalOpen(false), 2000);
      }
      setDeferredPrompt(null);
    } else {
      // If iOS or deferredPrompt unavailable, open modal with instructions
      setIsModalOpen(true);
    }
  };

  const handleDismiss = () => {
    setIsBannerVisible(false);
    localStorage.setItem('nrityasana_pwa_dismissed', 'true');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (onCloseManual) onCloseManual();
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Discreet Bottom-Floating Install Banner for Mobile & Desktop */}
      {isBannerVisible && !isModalOpen && (
        <div className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#1C1618] text-white p-3.5 rounded-2xl border border-[#3E2D33] shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Install Nrityasana</div>
                <div className="text-[11px] text-[#E5D5DA] truncate">Fast, offline app on Web, iOS & Android</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#1F161A] bg-[#F59E38] hover:bg-[#E58E28] transition shadow-xs cursor-pointer"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Cross-Platform Installation Guide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1C1618] text-white w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl border border-[#3E2D33] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#181114]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Install Nrityasana</h3>
                  <p className="text-[11px] text-[#E5D5DA]">Web, Android, iOS & Desktop Application</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {installedSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-center">
                  <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-emerald-300">Installation Initiated!</div>
                  <div className="text-xs text-white/80 mt-1">Nrityasana is now installed on your device.</div>
                </div>
              ) : isIos ? (
                /* iOS Safari Instructions */
                <div className="space-y-3">
                  <div className="text-xs text-[#F59E38] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Install on Apple iPhone & iPad:
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#23151B] border border-white/10 space-y-2.5 text-xs text-[#E5D5DA]">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#781D32] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-[#F59E38]" /> at the bottom bar of Safari.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#781D32] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#F59E38]" />.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#781D32] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Tap <strong>Add</strong> in the top-right corner to launch Nrityasana in standalone full-screen mode anytime!
                      </span>
                    </div>
                  </div>
                </div>
              ) : deferredPrompt ? (
                /* Android / Desktop Instant 1-Tap Install */
                <div className="space-y-3 text-center">
                  <div className="p-4 rounded-2xl bg-[#23151B] border border-white/10 space-y-2 text-xs text-[#E5D5DA]">
                    <div className="flex justify-center gap-4 text-white/70 py-1">
                      <div className="flex items-center gap-1"><Smartphone className="w-4 h-4 text-[#F59E38]" /> Android</div>
                      <div className="flex items-center gap-1"><Monitor className="w-4 h-4 text-[#F59E38]" /> Mac & Windows Desktop</div>
                    </div>
                    <p>Install Nrityasana for 1-tap home screen access, ultra-low latency, and instant practice sessions.</p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 rounded-2xl text-sm font-bold text-[#1F161A] bg-[#F59E38] hover:bg-[#E58E28] transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Install Application Now
                  </button>
                </div>
              ) : (
                /* Generic Desktop / Chrome instructions */
                <div className="space-y-3">
                  <div className="text-xs text-[#F59E38] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Monitor className="w-4 h-4" /> Desktop & Android Installation:
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#23151B] border border-white/10 space-y-2 text-xs text-[#E5D5DA]">
                    <p>
                      Look for the <strong>Install</strong> icon in your browser address bar (right side of URL), or open browser settings <strong className="text-white">⋮</strong> and select <strong>&quot;Install Nrityasana&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Benefits feature list */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-white/70 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Instant Launch
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Offline Caching
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Zero Address Bar
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Background Audio
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#181114] flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
