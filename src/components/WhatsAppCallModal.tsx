import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';
import { ChatContact } from '../types';

interface WhatsAppCallModalProps {
  contact: ChatContact;
  isVideo: boolean;
  onClose: () => void;
}

export const WhatsAppCallModal: React.FC<WhatsAppCallModalProps> = ({
  contact,
  isVideo,
  onClose,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(isVideo);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const contactName = contact.name || contact.email.split('@')[0];

  useEffect(() => {
    // Simulate contact answering after 2.5 seconds
    const timer = setTimeout(() => {
      setCallState('connected');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (callState !== 'connected') return;

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#111B21] text-white rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-between min-h-[520px] p-6 relative">
        {/* WhatsApp Call Header */}
        <div className="text-center pt-4 z-10">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#25D366] font-medium tracking-wide">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
            </svg>
            <span>WhatsApp {isVideo ? 'Video' : 'Voice'} Call</span>
          </div>
          <h3 className="font-serif text-2xl font-bold mt-2 text-white">
            {contactName}
          </h3>
          <p className="text-xs text-[#8696A0] mt-1">
            {callState === 'ringing' ? 'Ringing...' : formatDuration(duration)}
          </p>
        </div>

        {/* Center Avatar or Video Stream */}
        <div className="my-auto flex flex-col items-center justify-center relative w-full">
          {isVideo && isVideoOn && callState === 'connected' ? (
            <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-[#202C33] border border-white/10 flex items-center justify-center shadow-inner">
              <img
                src={contact.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80'}
                alt={contactName}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] text-white">
                {contactName} (Live Video)
              </div>
              <div className="absolute top-2 right-2 w-20 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-md bg-black">
                <div className="w-full h-full bg-[#1F2C34] flex items-center justify-center text-[10px] text-[#8696A0]">
                  You
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {callState === 'ringing' && (
                <span className="absolute -inset-4 rounded-full bg-[#25D366]/20 animate-ping" />
              )}
              <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-[#25D366] shadow-xl bg-[#202C33] flex items-center justify-center text-3xl font-bold text-white">
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contactName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  contactName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#25D366] text-white shadow-xs">
                {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call Controls */}
        <div className="w-full bg-[#202C33]/90 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-around z-10 border border-white/5">
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3 rounded-full transition cursor-pointer ${
              isSpeakerOn ? 'bg-white/20 text-white' : 'bg-white/5 text-[#8696A0]'
            }`}
            title="Speaker"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {isVideo && (
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full transition cursor-pointer ${
                isVideoOn ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'
              }`}
              title="Camera"
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full transition cursor-pointer ${
              isMuted ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white'
            }`}
            title="Mute"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
