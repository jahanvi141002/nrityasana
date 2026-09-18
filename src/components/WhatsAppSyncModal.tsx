import React, { useState } from 'react';
import { X, ExternalLink, Send, MessageSquare, Copy, Check } from 'lucide-react';

interface WhatsAppSyncModalProps {
  currentPhoneNumber: string;
  onClose: () => void;
  onUpdatePhoneNumber: (newNumber: string) => void;
  onSimulateInboundWebhook: (messageText: string) => void;
}

export const WhatsAppSyncModal: React.FC<WhatsAppSyncModalProps> = ({
  currentPhoneNumber,
  onClose,
  onUpdatePhoneNumber,
  onSimulateInboundWebhook,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber);
  const [testText, setTestText] = useState('Namaste Guru ji! I just completed my 20-minute daily practice on Nrityasana.');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePhoneNumber(phoneNumber.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestInbound = () => {
    if (!testText.trim()) return;
    onSimulateInboundWebhook(testText.trim());
    onClose();
  };

  const handleOpenDirectWhatsApp = () => {
    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent('Namaste from Nrityasana! I would like to connect for dance and yoga practice guidance.');
    const url = cleanNum ? `https://wa.me/${cleanNum}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-[28px] overflow-hidden shadow-2xl border border-[#F2E6E2] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#075E54] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">WhatsApp Live Integration</h3>
              <p className="text-xs text-white/80">Meta Cloud API & Direct WhatsApp (wa.me)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#1F161A]">
          {/* Quick Direct WhatsApp Chat */}
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#166534] text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                Direct WhatsApp Chat (wa.me)
              </h4>
              <button
                onClick={handleOpenDirectWhatsApp}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open WhatsApp
              </button>
            </div>
            <p className="text-xs text-[#15803D] leading-relaxed">
              Launch WhatsApp Web or the WhatsApp mobile app directly with Guru Meera or your community.
            </p>

            <form onSubmit={handleSavePhone} className="flex gap-2 pt-1">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#BBF7D0] focus:outline-none focus:border-[#166534]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-semibold rounded-xl cursor-pointer transition"
              >
                {savedSuccess ? 'Saved!' : 'Save Number'}
              </button>
            </form>
          </div>

          {/* Simulate Inbound WhatsApp Webhook */}
          <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#F3E8FF] space-y-3">
            <h4 className="font-bold text-[#6B21A8] text-sm flex items-center gap-1.5">
              <Send className="w-4 h-4 text-[#9333EA]" />
              Simulate Inbound WhatsApp Message
            </h4>
            <p className="text-xs text-[#7E22CE] leading-relaxed">
              Trigger a live incoming message as if received via the Meta WhatsApp Cloud API webhook into your live chatbox.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Message received from WhatsApp..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#E9D5FF] focus:outline-none focus:border-[#6B21A8]"
              />
              <button
                type="button"
                onClick={handleTestInbound}
                className="px-4 py-2 bg-[#7E22CE] hover:bg-[#6B21A8] text-white text-xs font-semibold rounded-xl cursor-pointer transition shrink-0"
              >
                Simulate Receive
              </button>
            </div>
          </div>

          {/* Meta Cloud API Webhook Details */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <h4 className="font-bold text-[#334155] text-sm">
              Meta WhatsApp Cloud API Configuration
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              When deploying with a Meta Developer App, configure your Webhook callback URL to sync incoming student messages:
            </p>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono text-[#334155]">
              <span className="truncate pr-2">{webhookUrl}</span>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="p-1.5 hover:bg-[#F1F5F9] rounded-lg transition text-[#64748B] hover:text-[#0F172A] cursor-pointer shrink-0"
                title="Copy Webhook URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#475569]">
              <div className="p-2 rounded-lg bg-white border border-[#E2E8F0]">
                <span className="font-bold block text-[#1E293B]">Verification:</span>
                hub.mode: &quot;subscribe&quot;
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E2E8F0]">
                <span className="font-bold block text-[#1E293B]">Webhook event:</span>
                Subscribe to &quot;messages&quot;
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
