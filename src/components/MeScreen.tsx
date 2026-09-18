import React, { useState, useRef } from 'react';
import { Camera, Video, Settings, Upload, X, Play, Image as ImageIcon } from 'lucide-react';
import { MediaItem, UserSession } from '../types';

interface MeScreenProps {
  session: UserSession;
  media: MediaItem[];
  onOpenProfile: () => void;
  onAddMedia: (newItem: Omit<MediaItem, 'id' | 'createdAt'>) => void;
}

export const MeScreen: React.FC<MeScreenProps> = ({
  session,
  media,
  onOpenProfile,
  onAddMedia,
}) => {
  const [pendingQueue, setPendingQueue] = useState<Array<{ name: string; type: 'photo' | 'video'; url: string }>>([]);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileTypeToPick, setFileTypeToPick] = useState<'image/*' | 'video/*'>('image/*');

  const initial = session.email ? session.email.charAt(0).toUpperCase() : 'M';

  const triggerPicker = (accept: 'image/*' | 'video/*') => {
    setFileTypeToPick(accept);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPendingQueue((prev) => [
          ...prev,
          {
            name: file.name,
            type: isVideo ? 'video' : 'photo',
            url: url || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleSavePending = () => {
    if (pendingQueue.length === 0) return;
    setIsUploading(true);

    setTimeout(() => {
      pendingQueue.forEach((item) => {
        onAddMedia({
          userId: session.userId,
          name: item.name,
          type: item.type,
          url: item.url,
        });
      });
      setPendingQueue([]);
      setIsUploading(false);
      setSuccessToast('Your media has been saved to your gallery');
      setTimeout(() => setSuccessToast(null), 3000);
    }, 400);
  };

  const removePending = (idx: number) => {
    setPendingQueue((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div id="me-screen" className="pb-28 pt-8 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={fileTypeToPick}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <div
            onClick={onOpenProfile}
            className="w-14 h-14 rounded-full bg-[#781D32] flex items-center justify-center font-bold text-white text-2xl shadow-xs overflow-hidden cursor-pointer ring-2 ring-[#781D32]/20"
          >
            {session.profilePictureUrl ? (
              <img src={session.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1F161A]">Me</h1>
            <p className="text-xs text-[#7D6D73] mt-0.5">{session.email}</p>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          title="Profile settings"
          className="p-2.5 rounded-full hover:bg-black/5 text-[#6B5C62] hover:text-[#1F161A] transition cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Your Moments */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-bold text-[#1F161A]">Your moments</h2>
        <p className="text-xs sm:text-sm text-[#6B5C62] mt-1 leading-relaxed">
          Keep the movement, the progress, and the little wins that belong to you.
        </p>

        {/* Buttons to pick photo / video */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => triggerPicker('image/*')}
            disabled={isUploading}
            className="py-3 px-4 rounded-xl border border-[#F2E6E2] bg-white/80 hover:bg-white text-[#1F161A] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Camera className="w-4 h-4 text-[#781D32]" />
            Photo
          </button>
          <button
            onClick={() => triggerPicker('video/*')}
            disabled={isUploading}
            className="py-3 px-4 rounded-xl border border-[#F2E6E2] bg-white/80 hover:bg-white text-[#1F161A] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Video className="w-4 h-4 text-[#781D32]" />
            Video
          </button>
        </div>

        {/* Pending upload list */}
        {pendingQueue.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-white/90 border border-[#F2E6E2] space-y-3">
            <span className="text-xs font-semibold text-[#6B5C62]">
              Ready to save ({pendingQueue.length})
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {pendingQueue.map((item, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-[#F2E6E2]">
                  {item.type === 'photo' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1F161A] flex items-center justify-center text-[#F59E38]">
                      <Play className="w-6 h-6" />
                    </div>
                  )}
                  <button
                    onClick={() => removePending(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleSavePending}
              disabled={isUploading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#781D32] hover:bg-[#641427] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Save to my gallery'}
            </button>
          </div>
        )}

        {/* Toast */}
        {successToast && (
          <div className="mt-3 p-3 rounded-xl bg-[#EAF5E9] text-[#2E6930] text-xs font-medium border border-[#C5E3C3]">
            {successToast}
          </div>
        )}
      </div>

      {/* Saved Media Gallery */}
      <div>
        <h2 className="font-serif text-xl font-bold text-[#1F161A] mb-3.5">
          Saved media
        </h2>

        {media.length === 0 ? (
          <div className="p-8 text-center bg-white/70 rounded-[22px] border border-[#F2E6E2]">
            <ImageIcon className="w-8 h-8 text-[#781D32] mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-[#1F161A]">Your gallery is waiting</h3>
            <p className="text-xs text-[#7D6D73] mt-1">
              Add a photo or video from your practice.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPreviewItem(item)}
                className="group relative aspect-square rounded-[20px] overflow-hidden bg-[#1F161A] shadow-2xs border border-[#F2E6E2] cursor-pointer"
              >
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1F161A] flex flex-col items-center justify-center text-[#F59E38] p-3">
                    <Play className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <span className="absolute left-3 bottom-2.5 text-[10px] font-bold text-white tracking-widest uppercase">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Media Viewer Modal */}
      {selectedPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative max-w-lg w-full bg-[#1F161A] rounded-[24px] overflow-hidden shadow-2xl p-4 flex flex-col items-center border border-white/10">
            <button
              onClick={() => setSelectedPreviewItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl mt-8">
              {selectedPreviewItem.type === 'photo' ? (
                <img
                  src={selectedPreviewItem.url}
                  alt={selectedPreviewItem.name}
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              ) : (
                <div className="p-12 text-center text-white">
                  <Play className="w-16 h-16 text-[#F59E38] mx-auto mb-3" />
                  <p className="text-sm font-semibold">{selectedPreviewItem.name}</p>
                  <p className="text-xs text-[#F9D2DF] mt-1">Movement practice recording</p>
                </div>
              )}
            </div>

            <p className="text-xs text-[#F9D2DF] mt-4 self-start px-2">
              {selectedPreviewItem.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
