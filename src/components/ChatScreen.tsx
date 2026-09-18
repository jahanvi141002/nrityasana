import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, ExternalLink, CheckCheck, MessageSquare, Smile } from 'lucide-react';
import { ChatContact, ChatMessage, UserSession } from '../types';

interface ChatScreenProps {
  session: UserSession;
  contacts: ChatContact[];
  messages: ChatMessage[];
  onSendMessage: (recipient: ChatContact, text: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  session,
  contacts,
  messages,
  onSendMessage,
}) => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !inputText.trim()) return;

    onSendMessage(selectedContact, inputText.trim());
    setInputText('');
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent('Join me in the Nrityasana community.');
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

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

  return (
    <div id="chat-screen" className="pb-20 max-w-2xl mx-auto min-h-[calc(100vh-80px)] flex flex-col">
      {!selectedContact ? (
        /* Contacts List View */
        <div className="flex-1 flex flex-col">
          {/* WhatsApp style Top Bar */}
          <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center text-[#F6D4A7]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Chats</h1>
                <p className="text-xs text-[#D8F3EE]">
                  {contacts.length} people in Nrityasana
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleOpenWhatsApp}
                title="Open WhatsApp"
                className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contact Items */}
          <div className="flex-1 divide-y divide-[#E8DFC8]/60 bg-[#F7F1E9]">
            {contacts.length === 0 ? (
              <div className="p-8 text-center text-[#75685F] text-sm">
                No other members yet.
              </div>
            ) : (
              contacts.map((contact) => {
                const name = contact.email.split('@')[0];
                const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                const initial = contact.email.charAt(0).toUpperCase();

                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/60 transition cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                        contact.role === 'ADMIN'
                          ? 'bg-[#D9A28C] text-[#4C2921]'
                          : 'bg-[#B8D9D0] text-[#075E54]'
                      }`}
                    >
                      {initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm text-[#201C1A] truncate">
                          {capitalizedName}
                        </h3>
                        {contact.role === 'ADMIN' && (
                          <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FBF0EC] text-[#B8543F] border border-[#F2D7D0]">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#75685F] truncate mt-0.5">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Conversation Thread View */
        <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
          {/* Thread Header */}
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  selectedContact.role === 'ADMIN'
                    ? 'bg-[#D9A28C] text-[#4C2921]'
                    : 'bg-[#B8D9D0] text-[#075E54]'
                }`}
              >
                {selectedContact.email.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="font-bold text-sm leading-tight">
                  {selectedContact.email.split('@')[0]}
                </h3>
                <p className="text-[11px] text-[#D8F3EE]">
                  {selectedContact.role === 'ADMIN' ? 'Admin account' : 'Member account'}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              title="Open WhatsApp"
              className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Background Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#ECE5DD]">
            {threadMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#75685F]">
                Start the conversation with {selectedContact.email.split('@')[0]}.
              </div>
            ) : (
              threadMessages.map((msg) => {
                const isMine = msg.senderId === session.userId || msg.email === session.email;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl shadow-2xs text-xs sm:text-sm leading-relaxed ${
                        isMine
                          ? 'bg-[#D9FDD3] text-[#303030] rounded-tr-xs'
                          : 'bg-white text-[#303030] rounded-tl-xs'
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
                        <span>{formatTime(msg.sentAt)}</span>
                        {isMine && <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-[#F0EAE2] border-t border-[#DDD3C7] flex items-center gap-2"
          >
            <div className="flex-1 relative flex items-center">
              <span className="absolute left-3 text-[#75685F]">
                <Smile className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white text-xs sm:text-sm text-[#201C1A] border-none focus:outline-none focus:ring-1 focus:ring-[#128C7E] shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-[#128C7E] hover:bg-[#0e7468] disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 -translate-x-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
