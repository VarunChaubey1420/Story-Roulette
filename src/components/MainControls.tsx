import React, { useState } from 'react';
import { Play, Video, Sparkles, Copy, RotateCcw, Settings, Volume2, VolumeX, Check, History } from 'lucide-react';
import { sound } from '../utils/audio';

interface MainControlsProps {
  isSpinning: boolean;
  hasSpunOnce: boolean;
  allReelsStopped: boolean;
  onSpinAll: () => void;
  onEnterRecordingMode: () => void;
  onRevealPrompt: () => void;
  onCopyPrompt: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MainControls: React.FC<MainControlsProps> = ({
  isSpinning,
  hasSpunOnce,
  allReelsStopped,
  onSpinAll,
  onEnterRecordingMode,
  onRevealPrompt,
  onCopyPrompt,
  onReset,
  onOpenSettings,
  onOpenHistory,
  soundEnabled,
  onToggleSound,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    onCopyPrompt();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      {/* Primary Action Button Deck */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {/* GRAND SPIN ALL LEVER BUTTON */}
        <button
          onClick={onSpinAll}
          disabled={isSpinning}
          className={`relative group px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-cinzel font-black tracking-[0.25em] text-sm sm:text-base uppercase transition-all duration-300 cursor-pointer overflow-hidden ${
            isSpinning
              ? 'bg-[#2A151C] text-[#8E7036] border-2 border-[#5A3F26] shadow-none cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-[#F0D598] via-[#C6A15B] to-[#9A7A3E] text-[#12080B] border-2 border-[#FFE8B5] shadow-[0_8px_30px_rgba(198,161,91,0.45),inset_0_2px_4px_rgba(255,255,255,0.6)] hover:brightness-110 hover:shadow-[0_12px_40px_rgba(198,161,91,0.6)] active:scale-[0.98]'
          }`}
          title="Spin all 4 reels to forge a story prompt"
        >
          {/* Subtle light sweep reflection */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <Play className={`w-5 h-5 ${isSpinning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isSpinning ? 'SPINNING ARCHIVES...' : 'SPIN ALL REELS'}</span>
          </div>
        </button>

        {/* REVEAL PROMPT (Appears prominently when reels stop) */}
        {allReelsStopped && (
          <button
            onClick={onRevealPrompt}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#4A1D27] to-[#2B1017] border-2 border-[#DFC38A] text-[#DFC38A] hover:text-[#FFF1D0] hover:border-[#FFF1D0] font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(223,195,138,0.35)] animate-pulse transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#DFC38A]" />
            <span>REVEAL THE PROMPT</span>
          </button>
        )}

        {/* RECORDING MODE (9:16) */}
        <button
          onClick={onEnterRecordingMode}
          disabled={isSpinning}
          className="px-5 py-4 rounded-2xl bg-[#1C1217] hover:bg-[#2A1620] border-2 border-[#795C37] hover:border-[#C6A15B] text-[#F1E6CF] font-cinzel font-semibold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40"
          title="Switch to 9:16 portrait composition for Instagram Reels"
        >
          <Video className="w-4 h-4 text-[#DFC38A]" />
          <span>RECORDING MODE</span>
        </button>
      </div>

      {/* Secondary Controls Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
        {/* COPY PROMPT */}
        <button
          onClick={handleCopy}
          disabled={isSpinning}
          className="px-4 py-2.5 rounded-xl bg-[#170F13] hover:bg-[#25151E] border border-[#5A3F26] hover:border-[#C6A15B] text-[#D5C7AA] font-cinzel tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
          title="Copy the current 4 prompt elements"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#C6A15B]" />
              <span>COPY PROMPT</span>
            </>
          )}
        </button>

        {/* RESET MACHINE */}
        <button
          onClick={onReset}
          disabled={isSpinning}
          className="px-4 py-2.5 rounded-xl bg-[#170F13] hover:bg-[#25151E] border border-[#5A3F26] hover:border-[#C6A15B] text-[#D5C7AA] font-cinzel tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
          title="Reset reels to ready state"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>RESET</span>
        </button>

        {/* PROMPT ROLL HISTORY */}
        <button
          onClick={onOpenHistory}
          disabled={isSpinning}
          className="px-4 py-2.5 rounded-xl bg-[#170F13] hover:bg-[#25151E] border border-[#5A3F26] hover:border-[#C6A15B] text-[#D5C7AA] font-cinzel tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
          title="View recent prompt history"
        >
          <History className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>HISTORY</span>
        </button>

        {/* SETTINGS / ADMIN */}
        <button
          onClick={onOpenSettings}
          disabled={isSpinning}
          className="px-4 py-2.5 rounded-xl bg-[#170F13] hover:bg-[#25151E] border border-[#5A3F26] hover:border-[#C6A15B] text-[#D5C7AA] font-cinzel tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
          title="Configure words, durations, and preferences"
        >
          <Settings className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>SETTINGS</span>
        </button>

        {/* MUTE / UNMUTE */}
        <button
          onClick={onToggleSound}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-[#170F13] hover:bg-[#25151E] border-[#5A3F26] text-[#DFC38A]'
              : 'bg-[#120A0E] border-[#3D251C] text-stone-500'
          }`}
          title={soundEnabled ? 'Mute Mechanical Audio' : 'Enable Mechanical Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>
      </div>
    </div>
  );
};
