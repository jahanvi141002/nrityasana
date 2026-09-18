import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  Smile,
  CheckCheck,
  Search,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { ChatContact, ChatMessage, UserSession } from '../types';
import { WhatsAppCallModal } from './WhatsAppCallModal';
import { WhatsAppSyncModal } from './WhatsAppSyncModal';

interface ChatScreenProps {
  session: UserSession;
  contacts: ChatContact[];
  messages: ChatMessage[];
  onSendMessage: (
    recipient: ChatContact,
    text: string,
    extra?: { type?: 'text' | 'voice' | 'image'; voiceDuration?: number; mediaUrl?: string }
  ) => void;
  primaryColor?: string;
}

const QUICK_EMOJIS = ['🙏', '🪷', '✨', '🧘', '❤️', '👏', '🕉️', '🌺', '🌿', '💃', '🔔', '☀️'];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  session,
  contacts,
  messages,
  onSendMessage,
  primaryColor: _primaryColor = '#075E54',
}) => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(contacts[0] || null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeCall, setActiveCall] = useState<{ isVideo: boolean } | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState('+919876543210');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact, isPeerTyping]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedContact || !inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    setShowEmojiPicker(false);

    onSendMessage(selectedContact, text, { type: 'text' });

    // Trigger WhatsApp live "typing..." simulation
    simulatePeerTypingResponse(selectedContact);
  };

  const simulatePeerTypingResponse = (_contact: ChatContact) => {
    // Show "typing..." after 500ms
    setTimeout(() => {
      setIsPeerTyping(true);
    }, 400);

    // Hide "typing..." after 1.8s
    setTimeout(() => {
      setIsPeerTyping(false);
    }, 1800);
  };

  const handleSendVoiceNote = () => {
    if (!selectedContact) return;
    const duration = Math.max(2, recordingSeconds);
    setIsRecording(false);

    onSendMessage(selectedContact, '🎙️ Voice note', {
      type: 'voice',
      voiceDuration: duration,
    });

    simulatePeerTypingResponse(selectedContact);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleSendQuickEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleOpenWhatsAppDirect = () => {
    const cleanNum = whatsAppNumber.replace(/[^0-9]/g, '');
    const defaultText = encodeURIComponent(
      `Namaste! Connecting via Nrityasana community with ${selectedContact?.name || 'Guru Meera'}.`
    );
    const url = cleanNum ? `https://wa.me/${cleanNum}?text=${defaultText}` : `https://wa.me/?text=${defaultText}`;
    window.open(url, '_blank');
  };

  const handleSimulateInboundWebhook = (messageText: string) => {
    if (!selectedContact) return;
    onSendMessage(selectedContact, messageText, {
      type: 'text',
    });
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return '10:30';
    }
  };

  // Filter contacts by search
  const filteredContacts = contacts.filter((c) => {
    const query = searchQuery.toLowerCase();
    const name = (c.name || c.email).toLowerCase();
    return name.includes(query) || (c.statusText && c.statusText.toLowerCase().includes(query));
  });

  // Filter messages for current thread
  const threadMessages = selectedContact
    ? messages.filter(
        (m) =>
          (m.senderId === session.userId && m.recipientId === selectedContact.id) ||
          (m.senderId === selectedContact.id && m.recipientId === session.userId) ||
          (m.email === session.email && m.recipientEmail === selectedContact.email) ||
          (m.email === selectedContact.email && m.recipientEmail === session.email)
      )
    : [];

  const contactDisplayName = selectedContact?.name || selectedContact?.email.split('@')[0] || 'Guru Meera';

  return (
    <div id="chat-screen" className="pb-20 max-w-3xl mx-auto h-[calc(100vh-70px)] flex flex-col bg-[#EFEAE2] overflow-hidden shadow-md">
      {/* Call Modal */}
      {activeCall && selectedContact && (
        <WhatsAppCallModal
          contact={selectedContact}
          isVideo={activeCall.isVideo}
          onClose={() => setActiveCall(null)}
        />
      )}

      {/* WhatsApp Sync & Meta Webhook Modal */}
      {isSyncModalOpen && (
        <WhatsAppSyncModal
          currentPhoneNumber={whatsAppNumber}
          onClose={() => setIsSyncModalOpen(false)}
          onUpdatePhoneNumber={(num) => setWhatsAppNumber(num)}
          onSimulateInboundWebhook={handleSimulateInboundWebhook}
        />
      )}

      {!selectedContact ? (
        /* WhatsApp Contacts List Screen */
        <div className="flex-1 flex flex-col bg-white">
          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <svg className="w-6 h-6 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
              </svg>
              <div>
                <h1 className="text-base font-bold leading-tight">WhatsApp Chats</h1>
                <p className="text-[11px] text-[#D8F3EE]">Nrityasana Live Community</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSyncModalOpen(true)}
                title="WhatsApp Meta API & Settings"
                className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-[#D8F3EE] hover:text-white"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenWhatsAppDirect}
                title="Launch Official WhatsApp"
                className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-[#D8F3EE] hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WhatsApp Search Bar */}
          <div className="p-2.5 bg-[#F6F6F6] border-b border-[#E9EDEF]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-[#54656F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or start new chat"
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-white text-xs text-[#111B21] border-none focus:outline-none focus:ring-1 focus:ring-[#075E54] shadow-2xs"
              />
            </div>
          </div>

          {/* WhatsApp Contact Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F2F2F2]">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667781]">
                No contacts found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const name = contact.name || contact.email.split('@')[0];
                const initial = name.charAt(0).toUpperCase();

                // Find last message with this contact
                const lastMsg = messages
                  .filter(
                    (m) =>
                      (m.senderId === contact.id && m.recipientId === session.userId) ||
                      (m.senderId === session.userId && m.recipientId === contact.id) ||
                      (m.email === contact.email && m.recipientEmail === session.email) ||
                      (m.email === session.email && m.recipientEmail === contact.email)
                  )
                  .slice(-1)[0];

                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#F5F6F6] transition cursor-pointer relative"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#075E54]/10 border border-[#E9EDEF] flex items-center justify-center font-bold text-sm text-[#075E54]">
                        {contact.avatar ? (
                          <img
                            src={contact.avatar}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-sm text-[#111B21] truncate flex items-center gap-1.5">
                          {name}
                          {contact.role === 'ADMIN' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#E7F8F0] text-[#075E54]">
                              TEACHER
                            </span>
                          )}
                        </h3>
                        <span className="text-[10px] text-[#667781] shrink-0">
                          {lastMsg ? formatTime(lastMsg.sentAt) : '10:30'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-xs text-[#667781] truncate">
                          {lastMsg ? (
                            lastMsg.type === 'voice' ? '🎙️ Voice note' : lastMsg.text
                          ) : (
                            contact.statusText || 'Available on WhatsApp'
                          )}
                        </p>
                        {lastMsg && lastMsg.senderId === session.userId && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Active WhatsApp Conversation Thread */
        <div className="flex-1 flex flex-col h-full bg-[#EFEAE2] relative">
          {/* WhatsApp Chat Header */}
          <div className="bg-[#075E54] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-xs z-20">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer text-white"
                title="Back to chats"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 flex items-center justify-center font-bold text-xs text-white border border-white/20">
                  {selectedContact.avatar ? (
                    <img
                      src={selectedContact.avatar}
                      alt={contactDisplayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    contactDisplayName.charAt(0).toUpperCase()
                  )}
                </div>
                {selectedContact.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] border border-white" />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-sm leading-tight text-white truncate">
                  {contactDisplayName}
                </h3>
                <p className="text-[11px] text-[#D8F3EE] truncate">
                  {isPeerTyping ? (
                    <span className="font-medium text-[#A7F3D0] flex items-center gap-1">
                      typing<span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                    </span>
                  ) : selectedContact.isOnline ? (
                    'Online'
                  ) : (
                    selectedContact.lastSeen || 'last seen today at 10:45 AM'
                  )}
                </p>
              </div>
            </div>

            {/* Header Action Buttons (Call, Video Call, WhatsApp wa.me, Options) */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveCall({ isVideo: true })}
                title="WhatsApp Video Call"
                className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-white"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveCall({ isVideo: false })}
                title="WhatsApp Voice Call"
                className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-white"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenWhatsAppDirect}
                title="Open Official WhatsApp (wa.me)"
                className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-[#25D366] hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="More options"
                  className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showOptionsMenu && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl py-1 z-30 border border-[#E9EDEF] text-xs text-[#111B21]">
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        handleOpenWhatsAppDirect();
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#F5F6F6] flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#25D366]" />
                      Open in WhatsApp Web / App
                    </button>
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setIsSyncModalOpen(true);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#F5F6F6] flex items-center gap-2 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#075E54]" />
                      WhatsApp API & Phone Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        simulatePeerTypingResponse(selectedContact);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#F5F6F6] flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#667781]" />
                      Simulate Inbound Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WhatsApp Messages Canvas */}
          <div
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 relative"
            style={{
              backgroundImage: `radial-gradient(#D1D7DB 0.75px, transparent 0.75px)`,
              backgroundSize: '16px 16px',
            }}
          >
            {/* Encryption & Notice Pill */}
            <div className="flex justify-center my-1">
              <div className="max-w-xs text-center px-3 py-1 rounded-lg bg-[#FFEECD] text-[#54656F] text-[10px] leading-relaxed shadow-2xs border border-[#FDE68A]">
                🔒 Messages are synchronized with your Nrityasana practice circle and WhatsApp community.
              </div>
            </div>

            {/* Date Separator */}
            <div className="flex justify-center my-2">
              <span className="px-3 py-1 rounded-lg bg-white/85 text-[#54656F] text-[10px] font-semibold uppercase tracking-wider shadow-2xs border border-white">
                TODAY
              </span>
            </div>

            {/* Messages Thread */}
            {threadMessages.map((msg) => {
              const isMine = msg.senderId === session.userId || msg.email === session.email;
              const isVoice = msg.type === 'voice';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2 rounded-2xl shadow-2xs text-xs sm:text-sm relative ${
                      isMine
                        ? 'bg-[#D9FDD3] text-[#111B21] rounded-tr-xs'
                        : 'bg-white text-[#111B21] rounded-tl-xs'
                    }`}
                  >
                    {/* Voice Note Bubble */}
                    {isVoice ? (
                      <div className="flex items-center gap-2.5 py-1 min-w-[200px] sm:min-w-[240px]">
                        <button
                          type="button"
                          onClick={() =>
                            setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)
                          }
                          className="w-9 h-9 rounded-full bg-[#075E54] hover:bg-[#128C7E] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1">
                          {/* Animated Voice Waves */}
                          <div className="flex items-center gap-0.5 h-6">
                            {[16, 28, 12, 34, 20, 36, 14, 26, 32, 18, 30, 22, 12, 28, 18].map(
                              (height, idx) => (
                                <span
                                  key={idx}
                                  className={`w-1 rounded-full transition-all ${
                                    playingVoiceId === msg.id
                                      ? 'bg-[#075E54] animate-pulse'
                                      : 'bg-[#8696A0]'
                                  }`}
                                  style={{ height: `${height}%` }}
                                />
                              )
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#667781] mt-0.5">
                            <span>0:{msg.voiceDuration ? msg.voiceDuration.toString().padStart(2, '0') : '14'}</span>
                            {msg.fromWhatsApp && (
                              <span className="text-[#25D366] font-semibold flex items-center gap-0.5">
                                WhatsApp
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Standard Text Message */
                      <p className="break-words leading-relaxed">{msg.text}</p>
                    )}

                    {/* Metadata: Timestamp and WhatsApp Ticks */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
                      <span>{formatTime(msg.sentAt)}</span>
                      {isMine && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Peer Typing Indicator Bubble */}
            {isPeerTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-xs bg-white text-[#54656F] text-xs shadow-2xs flex items-center gap-1.5">
                  <span className="text-[11px] font-medium">{contactDisplayName} is typing</span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#075E54] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#075E54] animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#075E54] animate-bounce delay-300" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emoji Tray */}
          {showEmojiPicker && (
            <div className="p-2 bg-white border-t border-[#E9EDEF] flex items-center gap-2 overflow-x-auto no-scrollbar shadow-inner">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendQuickEmoji(emoji)}
                  className="text-xl p-1.5 hover:bg-[#F0F2F5] rounded-lg transition cursor-pointer hover:scale-110 shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* WhatsApp Bottom Input Bar */}
          <div className="p-2 sm:p-2.5 bg-[#F0F2F5] border-t border-[#E9EDEF] flex items-center gap-2 z-20">
            {isRecording ? (
              /* Voice Recording Bar */
              <div className="flex-1 flex items-center justify-between bg-white px-4 py-2.5 rounded-full shadow-2xs border border-[#E9EDEF]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                  <span className="text-xs font-semibold text-red-600">
                    Recording 0:{recordingSeconds.toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancelRecording}
                    className="text-xs font-semibold text-[#667781] hover:text-red-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendVoiceNote}
                    className="p-1.5 rounded-full bg-[#25D366] text-white hover:bg-[#1EBE5D] cursor-pointer shadow-xs"
                    title="Send voice note"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Input Bar */
              <>
                <div className="flex items-center gap-1 text-[#54656F]">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-[#E9EDEF] rounded-full transition cursor-pointer"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + ' 📸 [Attached Practice Clip] ');
                    }}
                    className="p-2 hover:bg-[#E9EDEF] rounded-full transition cursor-pointer"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSend} className="flex-1 flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={600}
                    className="w-full px-4 py-2.5 rounded-lg bg-white text-xs sm:text-sm text-[#111B21] border-none focus:outline-none focus:ring-1 focus:ring-[#075E54] shadow-2xs"
                  />
                </form>

                {inputText.trim() ? (
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    className="w-10 h-10 rounded-full bg-[#075E54] hover:bg-[#128C7E] text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0 active:scale-95"
                    title="Send message"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsRecording(true)}
                    className="w-10 h-10 rounded-full bg-[#075E54] hover:bg-[#128C7E] text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0 active:scale-95"
                    title="Record voice note"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
