import React, { useState } from 'react';
import { Plus, Video, Clock, Users, Calendar, ExternalLink, X } from 'lucide-react';
import { LiveClass, UserSession } from '../types';

interface LiveClassesScreenProps {
  session: UserSession;
  classes: LiveClass[];
  onScheduleClass: (newClass: Omit<LiveClass, 'id' | 'participantCount' | 'joined'>) => void;
  onJoinClass: (classId: string) => void;
}

export const LiveClassesScreen: React.FC<LiveClassesScreenProps> = ({
  session,
  classes,
  onScheduleClass,
  onJoinClass,
}) => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(() => {
    const d = new Date(Date.now() + 1000 * 60 * 60 * 24);
    d.setMinutes(0);
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/');
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = session.role === 'ADMIN';

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please add a class title');
      return;
    }
    if (!meetingUrl.startsWith('http')) {
      setFormError('Please provide a valid meeting link (http:// or https://)');
      return;
    }

    onScheduleClass({
      title: title.trim(),
      description: description.trim(),
      startTime: new Date(startTime).toISOString(),
      durationMinutes,
      meetingUrl: meetingUrl.trim(),
      createdBy: session.email,
    });

    setTitle('');
    setDescription('');
    setFormError(null);
    setIsScheduleOpen(false);
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} at ${hours}:${minutes}`;
  };

  const isSoon = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  return (
    <div id="live-classes-screen" className="pb-24 pt-8 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#201C1A] tracking-tight">
            Live classes
          </h1>
          <p className="mt-2 text-[#5F554D] text-sm sm:text-base">
            {isAdmin
              ? 'Create a room for your students to move together.'
              : 'Join a live practice and move with your teacher.'}
          </p>
        </div>

        {isAdmin && (
          <button
            id="schedule-class-button"
            onClick={() => setIsScheduleOpen(true)}
            className="p-2.5 rounded-full bg-[#B8543F] hover:bg-[#A3432F] text-white transition shadow-sm cursor-pointer shrink-0 mt-1"
            title="Schedule class"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Class Cards */}
      <div className="space-y-4">
        {classes.length === 0 ? (
          <div className="p-8 text-center bg-white/65 rounded-[22px] border border-[#E8DFC8]">
            <Video className="w-9 h-9 text-[#B8543F] mx-auto mb-2" />
            <h3 className="font-semibold text-[#332B27]">No classes scheduled yet</h3>
            <p className="text-xs text-[#75685F] mt-1">
              Your teacher will post the next live session here.
            </p>
          </div>
        ) : (
          classes.map((cls) => {
            const soon = isSoon(cls.startTime);
            return (
              <div
                key={cls.id}
                className="p-5 sm:p-6 rounded-[22px] bg-white/75 border border-[#E8DFC8]/70 shadow-2xs space-y-3.5"
              >
                {/* Status & Participants */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase ${
                      soon
                        ? 'bg-[#F1D4C0] text-[#51261E]'
                        : 'bg-[#DCE2C8] text-[#33402E]'
                    }`}
                  >
                    {soon ? 'SOON' : 'UPCOMING'}
                  </span>
                  <span className="text-xs text-[#75685F] flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    {cls.participantCount} joined
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#201C1A]">
                    {cls.title}
                  </h3>
                  {cls.description && (
                    <p className="text-xs text-[#5F554D] mt-1.5 leading-relaxed">
                      {cls.description}
                    </p>
                  )}
                </div>

                {/* Timing Info */}
                <div className="flex items-center gap-4 text-xs text-[#5F554D] pt-1">
                  <div className="flex items-center gap-1.5 text-[#B8543F] font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(cls.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#75685F]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{cls.durationMinutes} min</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onJoinClass(cls.id)}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                      cls.joined
                        ? 'bg-[#E5DCD0] text-[#201C1A] hover:bg-[#D8CABE]'
                        : 'bg-[#B8543F] hover:bg-[#A3432F] text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>{cls.joined ? 'Join live room' : 'Join class'}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-[26px] max-w-md w-full p-6 shadow-2xl border border-[#E8DFC8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
              <h3 className="font-serif text-xl font-bold text-[#201C1A]">
                Schedule a live class
              </h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="p-1.5 text-[#75685F] hover:text-[#201C1A] rounded-full hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-2.5 rounded-lg bg-[#FDF2F0] text-[#B8543F] text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5F554D] mb-1">
                  Class title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aramandi Balance Immersion"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C7] text-sm text-[#201C1A] focus:outline-none focus:border-[#B8543F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F554D] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Session focus, props needed, or mudra sequences..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C7] text-sm text-[#201C1A] focus:outline-none focus:border-[#B8543F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5F554D] mb-1">
                    Start time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C7] text-xs text-[#201C1A] focus:outline-none focus:border-[#B8543F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5F554D] mb-1">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C7] text-xs text-[#201C1A] focus:outline-none focus:border-[#B8543F]"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F554D] mb-1">
                  Meeting link
                </label>
                <input
                  type="url"
                  required
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C7] text-sm text-[#201C1A] focus:outline-none focus:border-[#B8543F]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#DDD3C7] text-[#5F554D] text-xs font-semibold hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#B8543F] hover:bg-[#A3432F] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
