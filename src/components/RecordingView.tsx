import React, { useState, useEffect } from 'react';
import { WordCollections, SelectedPrompt, UserPreferences, CategoryKey } from '../types';
import { CATEGORIES } from '../data/defaultWords';
import { Reel } from './Reel';
import { sound } from '../utils/audio';
import { Play, RotateCcw, X, Volume2, VolumeX, Sparkles, Eye, Copy, Check } from 'lucide-react';

interface RecordingViewProps {
  words: WordCollections;
  selectedPrompt: SelectedPrompt;
  isSpinning: boolean;
  stopDelays: Record<CategoryKey, number>;
  onReelStopped: (categoryKey: string, word: string) => void;
  onSpin: () => void;
  onReset: () => void;
  onExit: () => void;
  preferences: UserPreferences;
  onToggleSound: () => void;
}

export const RecordingView: React.FC<RecordingViewProps> = ({
  words,
  selectedPrompt,
  isSpinning,
  stopDelays,
  onReelStopped,
  onSpin,
  onReset,
  onExit,
  preferences,
  onToggleSound,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSafeOverlay, setShowSafeOverlay] = useState<boolean>(preferences.recording.showSafeGuides);
  const [copied, setCopied] = useState<boolean>(false);
  const [allStopped, setAllStopped] = useState<boolean>(false);
  const [stoppedCount, setStoppedCount] = useState<number>(0);

  // Monitor stopped reels during spin
  useEffect(() => {
    if (isSpinning) {
      setAllStopped(false);
      setStoppedCount(0);
    }
  }, [isSpinning]);

  const handleReelStoppedInternal = (categoryKey: string, word: string) => {
    onReelStopped(categoryKey, word);
    setStoppedCount((prev) => {
      const next = prev + 1;
      if (next >= 4) {
        setAllStopped(true);
        if (preferences.recording.autoRevealAfterStop) {
          setTimeout(() => {
            sound.playReveal();
          }, 350);
        }
      }
      return next;
    });
  };

  const countdownIntervalRef = React.useRef<number | null>(null);

  // Clean up countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Start with countdown if enabled
  const triggerSpinWithCountdown = () => {
    if (isSpinning || countdown !== null) return;

    if (preferences.recording.enableCountdown) {
      let count = preferences.recording.countdownSeconds;
      setCountdown(count);
      sound.playCountdownTick(false);

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      countdownIntervalRef.current = window.setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
          sound.playCountdownTick(false);
        } else {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setCountdown(null);
          sound.playCountdownTick(true);
          onSpin();
        }
      }, 1000);
    } else {
      onSpin();
    }
  };

  const handleCopyPrompt = () => {
    const text = `MINERVA PRESENTS: STORY ROULETTE\n\n` +
      `I. CHARACTER: ${selectedPrompt.character}\n` +
      `II. SETTING: ${selectedPrompt.setting}\n` +
      `III. OBJECT: ${selectedPrompt.object}\n` +
      `IV. GENRE: ${selectedPrompt.genre}\n\n` +
      `"${preferences.branding.secondaryQuote}"`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      sound.playTick(1.4);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070506] flex items-center justify-center overflow-hidden select-none">
      {/* 9:16 Portrait Instagram Reels Canvas Enclosure */}
      <div 
        className="relative w-full h-full max-h-[100dvh] aspect-[9/16] max-w-[calc(100dvh*9/16)] flex flex-col justify-between overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)]"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #35151F 0%, #170A0F 50%, #090608 100%)',
        }}
      >
        {/* Subtle Atmospheric Vignette & Gold Frame Border */}
        <div className="pointer-events-none absolute inset-0 border border-[#C6A15B]/30 z-30" />
        <div className="pointer-events-none absolute inset-2 border border-[#C6A15B]/15 z-30" />

        {/* Floating Top Floating Action Bar (Discreet, auto-fading or toggleable) */}
        <div 
          className={`absolute top-4 inset-x-4 z-40 flex items-center justify-between transition-opacity duration-300 ${
            showControls ? 'opacity-90' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#C6A15B]/40 text-[#DFC38A] hover:bg-[#C6A15B]/20 text-xs font-cinzel flex items-center gap-1.5 cursor-pointer shadow-lg"
              title="Exit Recording Mode"
            >
              <X className="w-3.5 h-3.5" />
              <span>EXIT 9:16</span>
            </button>

            <button
              onClick={() => setShowSafeOverlay(!showSafeOverlay)}
              className={`p-1.5 rounded-full backdrop-blur-md border text-xs cursor-pointer shadow-lg transition-colors ${
                showSafeOverlay
                  ? 'bg-[#C6A15B] border-[#DFC38A] text-[#120B0E]'
                  : 'bg-black/60 border-[#C6A15B]/40 text-[#DFC38A]'
              }`}
              title="Toggle Instagram Reels Safe Margins"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#C6A15B]/40 text-[#DFC38A] hover:bg-[#C6A15B]/20 text-xs cursor-pointer shadow-lg"
              title="Toggle Audio"
            >
              {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>
        </div>

        {/* Simulated Instagram Safe Areas Guide (Optional visual aid for creators) */}
        {showSafeOverlay && (
          <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-6">
            <div className="h-20 border-b border-dashed border-[#DFC38A]/25 flex items-center justify-center text-[10px] font-mono text-[#DFC38A]/40 uppercase tracking-widest">
              Reels Header Zone
            </div>
            <div className="flex justify-between items-center h-full">
              <div className="text-[9px] font-mono text-[#DFC38A]/30 -rotate-90">SAFE MARGIN</div>
              <div className="w-16 border-l border-dashed border-[#DFC38A]/25 h-72 flex flex-col items-center justify-center text-[9px] font-mono text-[#DFC38A]/40 text-center leading-tight">
                Right Action Buttons
              </div>
            </div>
            <div className="h-32 border-t border-dashed border-[#DFC38A]/25 flex items-center justify-center text-[10px] font-mono text-[#DFC38A]/40 uppercase tracking-widest">
              Caption & Audio Zone
            </div>
          </div>
        )}

        {/* Countdown Overlay (3, 2, 1) */}
        {countdown !== null && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-[#DFC38A]/40 flex items-center justify-center shadow-[0_0_50px_rgba(198,161,91,0.5)]">
                <span className="font-cinzel text-7xl font-black text-[#F1E6CF] animate-pulse">
                  {countdown}
                </span>
              </div>
            </div>
            <p className="font-cinzel tracking-[0.3em] text-[#DFC38A] text-sm uppercase mt-6 font-semibold">
              PREPARING STORY ARCHIVE
            </p>
          </div>
        )}

        {/* TOP BRANDING SECTION */}
        <div className="pt-10 sm:pt-12 px-6 text-center relative z-20">
          {preferences.branding.showMinerva && (
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="h-[1px] w-8 bg-[#C6A15B]/50" />
              <span className="font-cinzel text-[11px] sm:text-xs font-bold tracking-[0.35em] text-[#C6A15B] uppercase">
                {preferences.branding.clubName}
              </span>
              <span className="h-[1px] w-8 bg-[#C6A15B]/50" />
            </div>
          )}

          <h1 className="font-cinzel text-3xl sm:text-4xl font-black tracking-wider text-[#FAF5EC] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            STORY ROULETTE
          </h1>

          <p className="font-garamond italic text-sm sm:text-base text-[#D5C7AA] mt-1 tracking-wide">
            "{preferences.branding.tagline}"
          </p>

          <div className="w-24 h-[1px] mx-auto mt-3 bg-gradient-to-r from-transparent via-[#C6A15B]/70 to-transparent" />
        </div>

        {/* CENTER MECHANICAL STACK (4 Vertical Word Reels stacked for optimal 9:16 mobile readability) */}
        <div className="px-4 py-2 flex flex-col justify-center gap-3 relative z-20 max-w-[420px] w-full mx-auto my-auto">
          {CATEGORIES.map((cat, index) => {
            const currentCatWords = words[cat.key] || [];
            return (
              <div key={cat.key} className="relative">
                <Reel
                  category={cat}
                  allWords={currentCatWords}
                  targetWord={selectedPrompt[cat.key]}
                  isSpinning={isSpinning}
                  stopDelayMs={stopDelays[cat.key]}
                  reelIndex={index}
                  onStopped={handleReelStoppedInternal}
                  isCompact={true}
                />
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION & PROMPT SUMMARY SECTION */}
        <div className="pb-8 pt-2 px-6 flex flex-col items-center relative z-20">
          <p className="font-garamond italic text-xs sm:text-sm text-[#C6A15B]/90 mb-4 text-center">
            "{preferences.branding.secondaryQuote}"
          </p>

          {/* Quick Actions in Recording Mode */}
          <div className="flex items-center gap-3 w-full max-w-[340px]">
            <button
              onClick={triggerSpinWithCountdown}
              disabled={isSpinning || countdown !== null}
              className={`flex-1 py-3 px-4 rounded-xl font-cinzel text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSpinning || countdown !== null
                  ? 'bg-[#2A191F] text-[#8E7036] border border-[#5A3F26] opacity-60'
                  : 'bg-gradient-to-r from-[#DFC38A] via-[#C6A15B] to-[#9A7A3E] text-[#100A0D] shadow-[0_4px_20px_rgba(198,161,91,0.4)] hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSpinning ? 'SPINNING...' : 'SPIN REELS'}</span>
            </button>

            <button
              onClick={handleCopyPrompt}
              disabled={isSpinning}
              className="p-3 rounded-xl bg-[#201216] border border-[#795C37] text-[#DFC38A] hover:bg-[#351C24] transition-all cursor-pointer disabled:opacity-50"
              title="Copy Prompt"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onReset}
              disabled={isSpinning}
              className="p-3 rounded-xl bg-[#201216] border border-[#795C37] text-[#D5C7AA] hover:bg-[#351C24] transition-all cursor-pointer disabled:opacity-50"
              title="Reset Machine"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between w-full max-w-[340px] text-[10px] text-[#8E7036]">
            <span className="font-mono">REEL RATIO: 9:16</span>
            <button 
              onClick={() => setShowControls(!showControls)}
              className="hover:text-[#DFC38A] underline cursor-pointer"
            >
              {showControls ? 'Hide Interface Overlays' : 'Show Overlays'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
