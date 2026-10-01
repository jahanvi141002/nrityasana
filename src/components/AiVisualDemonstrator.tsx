import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  Activity,
  Layers,
  CheckCircle2,
  Maximize2,
  Info,
  Compass,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
} from 'lucide-react';
import { Practice } from '../types';
import { getPracticeAiVisualDemo } from '../utils/aiVisualDemos';
import { triggerHapticFeedback } from '../utils/sound';

interface AiVisualDemonstratorProps {
  practice: Practice;
  currentStepIndex?: number;
  isCompact?: boolean;
  onExpandFullScreen?: () => void;
}

export const AiVisualDemonstrator: React.FC<AiVisualDemonstratorProps> = ({
  practice,
  currentStepIndex = 0,
  isCompact = false,
  onExpandFullScreen,
}) => {
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [viewMode, setViewMode] = useState<'hybrid' | 'avatar' | 'studio'>('hybrid');
  const [activeTab, setActiveTab] = useState<'visual' | 'biomechanics' | 'checkpoints' | 'muscles'>('visual');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState<0.5 | 1 | 1.5>(1);

  // Breathing / Kinetic Motion Cycle State (Paced like fitness apps)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ground'>('Inhale');
  const [breathProgress, setBreathProgress] = useState(0); // 0 to 100
  const [animationCycle, setAnimationCycle] = useState(0); // 0 to 100 loop

  const demoData = getPracticeAiVisualDemo(practice);
  const currentStepText = practice.instructions?.[currentStepIndex] || demoData.keyInstructions[0] || practice.description;

  // Exercise App Style Breathing & Kinetic Animation Loop
  useEffect(() => {
    if (!isAnimationPlaying) return;

    const intervalTime = 50 / animationSpeed;
    const interval = setInterval(() => {
      setAnimationCycle((prev) => (prev + 1) % 100);

      setBreathProgress((prev) => {
        const next = prev + 1.25 * animationSpeed;
        if (next >= 100) {
          setBreathPhase((current) => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            if (current === 'Exhale') return 'Ground';
            return 'Inhale';
          });
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isAnimationPlaying, animationSpeed]);

  // Derived kinetic joint offsets based on animation loop (simulates smooth organic breathing & limb sway)
  const kineticSway = Math.sin((animationCycle / 100) * Math.PI * 2);
  const breathExpansion = Math.sin((breathProgress / 100) * Math.PI);

  const toggleAnimationPlay = () => {
    triggerHapticFeedback('light');
    setIsAnimationPlaying((prev) => !prev);
  };

  const handleSpeedChange = (speed: 0.5 | 1 | 1.5) => {
    triggerHapticFeedback('light');
    setAnimationSpeed(speed);
  };

  return (
    <div className="rounded-[24px] overflow-hidden bg-[#140E11] border border-[#3E2D33] shadow-2xl flex flex-col select-none">
      {/* Top Banner Bar - Exercise App HUD Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#24131C] via-[#1B1116] to-[#24131C] border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
          </span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#F59E38]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              AI Kinetic Posture Guide
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#781D32] text-[#F9D2DF] font-semibold border border-[#B82B5A]/40 hidden xs:inline">
            {demoData.demonstratorName}
          </span>
        </div>

        {/* View Mode Switcher: Hybrid / 3D Avatar / Studio */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light');
              setViewMode('hybrid');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              viewMode === 'hybrid'
                ? 'bg-[#781D32] text-white shadow-2xs'
                : 'text-white/60 hover:text-white'
            }`}
            title="Studio Master with Animated Biometric Wireframe"
          >
            Hybrid AI
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light');
              setViewMode('avatar');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              viewMode === 'avatar'
                ? 'bg-[#0284C7] text-white shadow-2xs'
                : 'text-white/60 hover:text-white'
            }`}
            title="Exercise App 3D Kinetic Avatar"
          >
            3D Skeleton
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light');
              setViewMode('studio');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              viewMode === 'studio'
                ? 'bg-white/20 text-white shadow-2xs'
                : 'text-white/60 hover:text-white'
            }`}
            title="Clean Studio Master"
          >
            Studio
          </button>
        </div>

        {/* HUD Quick Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowAiOverlay(!showAiOverlay)}
            className={`p-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
              showAiOverlay
                ? 'bg-[#E25B88]/20 border-[#E25B88]/50 text-[#F9D2DF]'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
            title="Toggle Biometric Telemetry"
          >
            <Layers className="w-3.5 h-3.5 text-[#F59E38]" />
          </button>

          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer border border-white/10"
            title={isAudioMuted ? 'Unmute rhythm cues' : 'Mute rhythm cues'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#F59E38]" />}
          </button>

          {onExpandFullScreen && (
            <button
              type="button"
              onClick={onExpandFullScreen}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer border border-white/10"
              title="Full screen view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Visual Stage with Animated Posture Skeleton & Exercise UI */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group select-none">
        {/* Background Layer: Real Demonstrator or 3D Grid */}
        {viewMode !== 'avatar' ? (
          <img
            src={demoData.imageUrl}
            alt={`${demoData.demonstratorName} demonstrating ${practice.title}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          />
        ) : (
          /* 3D Fitness Tech Grid Canvas (Nike / Peloton athletic aesthetic) */
          <div className="w-full h-full bg-[#0B090C] relative flex items-center justify-center overflow-hidden">
            {/* Perspective Grid Background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#0284c7 1px, transparent 1px), linear-gradient(90deg, #0284c7 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Center Stage Ring */}
            <div className="w-80 h-80 rounded-full border border-cyan-500/20 absolute opacity-30 animate-pulse pointer-events-none" />
            <div className="w-56 h-56 rounded-full border border-[#E25B88]/20 absolute opacity-25 pointer-events-none" />
          </div>
        )}

        {/* Ambient Darkness Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

        {/* =================================================================== */}
        {/* ANIMATED KINETIC SKELETON (Exercise App Animated Biometrics) */}
        {/* =================================================================== */}
        {(viewMode === 'hybrid' || viewMode === 'avatar') && showAiOverlay && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 600 340"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Glowing Pulse Filter */}
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Linear Gradients for Kinetic Lines */}
              <linearGradient id="kinetic-bone-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Kinetic Dynamic Coords based on practice discipline & sway */}
            {(() => {
              // Animated Head, Spine, Shoulders, Arms, Hips, Knees, Feet
              const headX = 300 + kineticSway * 3;
              const headY = 60 - breathExpansion * 3;
              const neckY = headY + 28;
              const spineMidY = neckY + 50;
              const pelvisY = spineMidY + 55;

              // Shoulders
              const leftShoulderX = 250 - breathExpansion * 4;
              const rightShoulderX = 350 + breathExpansion * 4;
              const shoulderY = neckY + 8;

              // Elbows & Hands (Dynamic based on discipline)
              const leftElbowX = 205 + kineticSway * 4;
              const leftElbowY = 120;
              const leftHandX = 160 + kineticSway * 6;
              const leftHandY = 135;

              const rightElbowX = 395 - kineticSway * 4;
              const rightElbowY = 120;
              const rightHandX = 440 - kineticSway * 6;
              const rightHandY = 135;

              // Pelvis & Legs
              const leftHipX = 275;
              const rightHipX = 325;
              const hipY = pelvisY;

              const leftKneeX = 230 + kineticSway * 2;
              const leftKneeY = hipY + 65;
              const leftFootX = 210;
              const leftFootY = leftKneeY + 70;

              const rightKneeX = 370 - kineticSway * 2;
              const rightKneeY = hipY + 65;
              const rightFootX = 390;
              const rightFootY = rightKneeY + 70;

              return (
                <g className="transition-all duration-75">
                  {/* Spine Core Flow Line */}
                  <line
                    x1={headX}
                    y1={neckY}
                    x2={headX}
                    y2={pelvisY}
                    stroke="url(#kinetic-bone-grad)"
                    strokeWidth="3.5"
                    strokeDasharray="6 3"
                    filter="url(#glow-cyan)"
                  />

                  {/* Clavicle / Shoulder Line */}
                  <line
                    x1={leftShoulderX}
                    y1={shoulderY}
                    x2={rightShoulderX}
                    y2={shoulderY}
                    stroke="#38BDF8"
                    strokeWidth="3"
                    filter="url(#glow-cyan)"
                  />

                  {/* Left Arm Chain */}
                  <line
                    x1={leftShoulderX}
                    y1={shoulderY}
                    x2={leftElbowX}
                    y2={leftElbowY}
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />
                  <line
                    x1={leftElbowX}
                    y1={leftElbowY}
                    x2={leftHandX}
                    y2={leftHandY}
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />

                  {/* Right Arm Chain */}
                  <line
                    x1={rightShoulderX}
                    y1={shoulderY}
                    x2={rightElbowX}
                    y2={rightElbowY}
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />
                  <line
                    x1={rightElbowX}
                    y1={rightElbowY}
                    x2={rightHandX}
                    y2={rightHandY}
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />

                  {/* Pelvic Belt */}
                  <line
                    x1={leftHipX}
                    y1={hipY}
                    x2={rightHipX}
                    y2={hipY}
                    stroke="#F59E38"
                    strokeWidth="3"
                  />

                  {/* Left Leg Chain */}
                  <line
                    x1={leftHipX}
                    y1={hipY}
                    x2={leftKneeX}
                    y2={leftKneeY}
                    stroke="#38BDF8"
                    strokeWidth="3"
                  />
                  <line
                    x1={leftKneeX}
                    y1={leftKneeY}
                    x2={leftFootX}
                    y2={leftFootY}
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />

                  {/* Right Leg Chain */}
                  <line
                    x1={rightHipX}
                    y1={hipY}
                    x2={rightKneeX}
                    y2={rightKneeY}
                    stroke="#38BDF8"
                    strokeWidth="3"
                  />
                  <line
                    x1={rightKneeX}
                    y1={rightKneeY}
                    x2={rightFootX}
                    y2={rightFootY}
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />

                  {/* Joint Nodes (Pulsing Biometric Sensors) */}
                  {/* Head / Drishti Node */}
                  <circle cx={headX} cy={headY} r="14" fill="#0284C7" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="2" filter="url(#glow-cyan)" />
                  <circle cx={headX} cy={headY} r="4" fill="#F8FAFC" />

                  {/* Shoulder Nodes */}
                  <circle cx={leftShoulderX} cy={shoulderY} r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx={rightShoulderX} cy={shoulderY} r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />

                  {/* Elbow Nodes */}
                  <circle cx={leftElbowX} cy={leftElbowY} r="4.5" fill="#818CF8" />
                  <circle cx={rightElbowX} cy={rightElbowY} r="4.5" fill="#818CF8" />

                  {/* Mudra / Hand Nodes */}
                  <circle cx={leftHandX} cy={leftHandY} r="5.5" fill="#F59E38" stroke="#FFFFFF" strokeWidth="1.5" filter="url(#glow-gold)" />
                  <circle cx={rightHandX} cy={rightHandY} r="5.5" fill="#F59E38" stroke="#FFFFFF" strokeWidth="1.5" filter="url(#glow-gold)" />

                  {/* Spine Core Center */}
                  <circle cx={headX} cy={spineMidY} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />

                  {/* Hip Nodes */}
                  <circle cx={leftHipX} cy={hipY} r="5" fill="#38BDF8" />
                  <circle cx={rightHipX} cy={hipY} r="5" fill="#38BDF8" />

                  {/* Knee Flexion Nodes */}
                  <circle cx={leftKneeX} cy={leftKneeY} r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" filter="url(#glow-cyan)" />
                  <circle cx={rightKneeX} cy={rightKneeY} r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" filter="url(#glow-cyan)" />

                  {/* Foot Grounding Pressure Rings */}
                  <circle cx={leftFootX} cy={leftFootY} r="7" fill="#F59E38" fillOpacity="0.3" stroke="#F59E38" strokeWidth="2" />
                  <circle cx={rightFootX} cy={rightFootY} r="7" fill="#F59E38" fillOpacity="0.3" stroke="#F59E38" strokeWidth="2" />

                  {/* Biometric Angle Tag Overlays */}
                  <g className="font-mono text-[9px] font-bold fill-white">
                    {/* Spine Angle Tag */}
                    <rect x={headX + 10} y={spineMidY - 10} width="68" height="18" rx="6" fill="#000000" fillOpacity="0.75" stroke="#10B981" strokeWidth="1" />
                    <text x={headX + 15} y={spineMidY + 3} fill="#10B981">
                      Axis: {demoData.biomechanics.spineAxisAngle}
                    </text>

                    {/* Knee Turnout / Flexion Tag */}
                    <rect x={rightKneeX + 12} y={rightKneeY - 10} width="66" height="18" rx="6" fill="#000000" fillOpacity="0.75" stroke="#38BDF8" strokeWidth="1" />
                    <text x={rightKneeX + 17} y={rightKneeY + 3} fill="#38BDF8">
                      Flex: 90° Turn
                    </text>
                  </g>
                </g>
              );
            })()}
          </svg>
        )}

        {/* =================================================================== */}
        {/* HUD TELEMETRY OVERLAYS */}
        {/* =================================================================== */}
        {showAiOverlay && (
          <div className="absolute inset-0 pointer-events-none p-3 sm:p-4 flex flex-col justify-between">
            {/* Top Row: AI Accuracy Telemetry & Live Breathing Metronome */}
            <div className="flex items-start justify-between gap-2">
              {/* Top Left: Alignment telemetry score */}
              <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 shadow-lg">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/70 font-mono">Real-Time Posture</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                    <span>{demoData.alignmentScore}% Target Match</span>
                    <span className="text-[10px] text-emerald-300 font-normal hidden xs:inline">(Optimal)</span>
                  </div>
                </div>
              </div>

              {/* Top Right: Exercise App Breathing Pacer Ring (Peloton/Apple Fitness style) */}
              <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 shadow-lg text-right">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-cyan-300 font-mono">Breath Cadence</div>
                  <div className="text-xs font-bold text-white font-mono flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                    <span>{breathPhase}</span>
                  </div>
                </div>
                {/* Circular Mini Progress Pacer */}
                <div className="w-7 h-7 rounded-full border-2 border-cyan-500/30 flex items-center justify-center relative">
                  <div
                    className="w-4 h-4 rounded-full bg-cyan-400/80 transition-all duration-300"
                    style={{ transform: `scale(${0.6 + (breathProgress / 100) * 0.7})` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Live Dynamic Coaching Cue & Animation Controls */}
            <div className="space-y-2 pointer-events-auto">
              <div className="bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#781D32] flex items-center justify-center shrink-0 border border-[#E25B88]/40 shadow-xs">
                    <Eye className="w-4 h-4 text-[#F6D4A7]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#F59E38] font-mono">
                        Step {currentStepIndex + 1} Form Cue
                      </span>
                      <span className="text-[9px] text-cyan-300 font-mono hidden xs:inline">• {demoData.biomechanics.drishtiFocalPoint}</span>
                    </div>
                    <p className="text-xs text-white font-medium line-clamp-1 leading-snug mt-0.5">
                      {currentStepText}
                    </p>
                  </div>
                </div>

                {/* Animated Loop Controls (Play/Pause, Slow-Mo) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={toggleAnimationPlay}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                    title={isAnimationPlaying ? 'Pause Kinetic Animation' : 'Play Kinetic Animation'}
                  >
                    {isAnimationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
                    {([0.5, 1, 1.5] as const).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                          animationSpeed === spd
                            ? 'bg-[#0284C7] text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Tabs for Exercise App Practice Insights */}
      {!isCompact && (
        <div className="p-4 bg-[#181115]">
          {/* Sub Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-[#100A0D] rounded-xl border border-white/10 mb-3.5">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'visual'
                  ? 'bg-[#781D32] text-white shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Posture Cues</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('muscles')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'muscles'
                  ? 'bg-[#781D32] text-white shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Muscles</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checkpoints')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'checkpoints'
                  ? 'bg-[#781D32] text-white shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Checkpoints ({demoData.postureCheckpoints.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('biomechanics')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'biomechanics'
                  ? 'bg-[#781D32] text-white shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Angles & HUD</span>
            </button>
          </div>

          {/* TAB 1: Posture Cues & Key Instructions */}
          {activeTab === 'visual' && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-[#F59E38] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Movement Biomechanics Rules:
              </div>
              <ul className="space-y-1.5">
                {demoData.keyInstructions.map((instruction, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#23151B] border border-white/5 text-xs text-[#FAF3F0] flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#781D32] text-[#F9D2DF] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 2: Target Muscle Activation Heatmap (Exercise App Aesthetic) */}
          {activeTab === 'muscles' && (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Primary Muscular Engagement & Synergy:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { name: 'Core & Transverse Abdominis', load: 92, role: 'Spinal Neutrality & Balance', color: 'from-amber-500 to-rose-500' },
                  { name: 'Quadriceps & Gluteal Stabilizers', load: 88, role: 'Grounding & Aramandi Turnout', color: 'from-cyan-500 to-blue-500' },
                  { name: 'Adductors & Deep Hip Flexors', load: 84, role: 'Flexibility & Kinetic Drive', color: 'from-emerald-500 to-teal-500' },
                  { name: 'Trapezius & Mudra Forearms', load: 78, role: 'Graceful Hasta Form & Extension', color: 'from-fuchsia-500 to-pink-500' },
                ].map((muscle, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#21151B] border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{muscle.name}</span>
                      <span className="font-mono text-[10px] font-bold text-cyan-300">{muscle.load}%</span>
                    </div>
                    {/* Progress Fill Bar */}
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${muscle.color}`}
                        style={{ width: `${muscle.load}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-white/50">{muscle.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Biometric Checkpoints */}
          {activeTab === 'checkpoints' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoData.postureCheckpoints.map((cp, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#23151B] border border-white/5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {cp.label}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase font-mono font-semibold">
                      {cp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 leading-normal">{cp.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Detailed Biomechanics & Angle Indicators */}
          {activeTab === 'biomechanics' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#23151B] border border-white/5">
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">Spinal Axis</div>
                <div className="font-semibold text-emerald-400 font-mono mt-0.5">{demoData.biomechanics.spineAxisAngle}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#23151B] border border-white/5">
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">Drishti Eye Focal</div>
                <div className="font-semibold text-cyan-300 font-mono mt-0.5">{demoData.biomechanics.drishtiFocalPoint}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#23151B] border border-white/5">
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">Ground Weight Ratio</div>
                <div className="font-semibold text-white font-mono mt-0.5">{demoData.biomechanics.weightDistribution}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#23151B] border border-white/5">
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">Breath Rhythm</div>
                <div className="font-semibold text-[#F59E38] font-mono mt-0.5">{demoData.biomechanics.breathCadence}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
