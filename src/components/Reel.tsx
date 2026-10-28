import React, { useEffect, useState, useRef } from 'react';
import { CategoryConfig } from '../types';
import { sound } from '../utils/audio';
import { getRandomIndex } from '../utils/random';

interface ReelProps {
  category: CategoryConfig;
  allWords: string[];
  targetWord: string;
  isSpinning: boolean;
  stopDelayMs: number;
  reelIndex: number;
  onStopped?: (categoryKey: string, word: string) => void;
  isCompact?: boolean;
}

export const Reel: React.FC<ReelProps> = ({
  category,
  allWords,
  targetWord,
  isSpinning,
  stopDelayMs,
  reelIndex,
  onStopped,
  isCompact = false,
}) => {
  const [displayWord, setDisplayWord] = useState<string>(targetWord || allWords[0] || 'Unknown');
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [hasPulse, setHasPulse] = useState<boolean>(false);
  const [subWords, setSubWords] = useState<string[]>([]);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [blurAmount, setBlurAmount] = useState<number>(0);

  const spinIntervalRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const isCurrentlySpinningRef = useRef<boolean>(false);

  // Sync display if targetWord updates externally when idle
  useEffect(() => {
    if (!isSpinning && targetWord) {
      setDisplayWord(targetWord);
      setIsLocked(true);
    }
  }, [targetWord, isSpinning]);

  // Main spin animation engine
  useEffect(() => {
    if (isSpinning) {
      isCurrentlySpinningRef.current = true;
      setIsLocked(false);
      setHasPulse(false);

      // Populate a running cycle strip of words
      const strip: string[] = [];
      for (let i = 0; i < 15; i++) {
        strip.push(allWords[getRandomIndex(allWords.length)]);
      }
      setSubWords(strip);

      let step = 0;
      let tickInterval = 60; // ms per tick at max speed
      const startTime = performance.now();

      const runSpinCycle = () => {
        if (!isCurrentlySpinningRef.current) return;

        // Pick next cycling word
        const randomWord = allWords[getRandomIndex(allWords.length)];
        setDisplayWord(randomWord);

        // Sound effect - tick occasionally based on reel index to avoid sound mud
        const now = performance.now();
        if (now - lastTickTimeRef.current > 75) {
          sound.playTick(1.0 + reelIndex * 0.12);
          lastTickTimeRef.current = now;
        }

        // Mechanical jitter / vertical offset blur
        step++;
        const jitter = (step % 2 === 0 ? 3 : -3);
        setOffsetY(jitter);
        setBlurAmount(1.2);

        spinIntervalRef.current = window.setTimeout(runSpinCycle, tickInterval);
      };

      // Start spinning
      runSpinCycle();

      // Schedule deceleration and precise stop
      stopTimeoutRef.current = window.setTimeout(() => {
        // Begin deceleration phase
        if (spinIntervalRef.current) {
          clearTimeout(spinIntervalRef.current);
        }

        let decelSteps = 8;
        let decelDelay = 80;

        const doDecel = () => {
          decelSteps--;
          if (decelSteps > 0) {
            setDisplayWord(allWords[getRandomIndex(allWords.length)]);
            sound.playTick(0.9 + (decelSteps * 0.05));
            decelDelay += 35;
            setBlurAmount(decelSteps > 3 ? 0.8 : 0.2);
            setOffsetY(decelSteps % 2 === 0 ? 2 : -2);
            spinIntervalRef.current = window.setTimeout(doDecel, decelDelay);
          } else {
            // FINALIZE STOP ON TARGET WORD
            isCurrentlySpinningRef.current = false;
            setDisplayWord(targetWord);
            setOffsetY(0);
            setBlurAmount(0);
            setIsLocked(true);
            setHasPulse(true);

            // Play mechanical latch clack
            sound.playReelStop(reelIndex);

            if (onStopped) {
              onStopped(category.key, targetWord);
            }

            // Remove pulse after animation completes
            setTimeout(() => {
              setHasPulse(false);
            }, 600);
          }
        };

        doDecel();
      }, stopDelayMs);
    } else {
      isCurrentlySpinningRef.current = false;
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      setOffsetY(0);
      setBlurAmount(0);
    }

    return () => {
      isCurrentlySpinningRef.current = false;
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [isSpinning, stopDelayMs, allWords, targetWord, category.key, reelIndex, onStopped]);

  return (
    <div className={`relative flex flex-col flex-1 min-w-[200px] max-w-full select-none transition-all duration-300 ${isCompact ? 'min-w-[170px]' : ''}`}>
      {/* Top Roman Numeral & Category Brass Plaque */}
      <div className="relative mb-2 flex items-center justify-center">
        <div className="relative z-10 px-4 py-1 rounded bg-gradient-to-b from-[#2A171C] to-[#120B0E] border border-[#C6A15B]/50 shadow-md flex items-center gap-2">
          {/* Decorative brass corner screws */}
          <div className="rivet absolute -top-1 -left-1" />
          <div className="rivet absolute -top-1 -right-1" />
          
          <span className="font-cinzel text-xs font-bold text-[#DFC38A] tracking-widest">
            {category.numeral}.
          </span>
          <span className="font-cinzel text-xs tracking-[0.2em] font-semibold text-[#F1E6CF] uppercase">
            {category.label}
          </span>
        </div>
      </div>

      {/* Mechanical Reel Drum Housing */}
      <div 
        className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
          hasPulse ? 'ring-2 ring-[#DFC38A] shadow-[0_0_25px_rgba(223,195,138,0.45)]' : 'shadow-[0_8px_24px_rgba(0,0,0,0.8)]'
        }`}
        style={{
          background: 'linear-gradient(180deg, #181412 0%, #201719 50%, #141010 100%)',
          border: '2px solid #5C4325',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.7)',
        }}
      >
        {/* Brass Bezel Accents */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#795C37] via-[#DFC38A] to-[#795C37] z-20 opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[#4D3A22] via-[#C6A15B] to-[#4D3A22] z-20 opacity-80" />

        {/* 3D Cylindrical Drum Shading (Top shadow curved inwards) */}
        <div 
          className="pointer-events-none absolute inset-x-0 top-0 h-14 z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10, 8, 8, 0.95) 0%, rgba(10, 8, 8, 0.6) 50%, rgba(10, 8, 8, 0) 100%)',
          }}
        />

        {/* 3D Cylindrical Drum Shading (Bottom shadow curved inwards) */}
        <div 
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 z-20"
          style={{
            background: 'linear-gradient(to top, rgba(10, 8, 8, 0.95) 0%, rgba(10, 8, 8, 0.6) 50%, rgba(10, 8, 8, 0) 100%)',
          }}
        />

        {/* Selection Reticle Frame (The center window where words lock) */}
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[76px] z-10 pointer-events-none rounded border border-[#C6A15B]/40 bg-[#C6A15B]/5 shadow-[inset_0_0_12px_rgba(198,161,91,0.15)] flex items-center justify-between px-1">
          {/* Left Brass Pointer */}
          <div className="text-[#C6A15B] text-[10px] filter drop-shadow">
            ▶
          </div>
          {/* Center Glass Sheen line */}
          <div className="absolute inset-x-4 top-1 h-[1px] bg-gradient-to-r from-transparent via-[#FFF1D0]/25 to-transparent" />
          {/* Right Brass Pointer */}
          <div className="text-[#C6A15B] text-[10px] filter drop-shadow">
            ◀
          </div>
        </div>

        {/* Roller Drum Window Height */}
        <div className={`relative w-full ${isCompact ? 'h-[110px]' : 'h-[135px]'} flex items-center justify-center overflow-hidden px-4`}>
          {/* Antique paper/vellum background strip texture */}
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#C6A15B 0.75px, transparent 0.75px)',
              backgroundSize: '8px 8px',
            }}
          />

          {/* Central Animated Word Item */}
          <div
            className="relative z-10 w-full text-center px-2 flex items-center justify-center transition-transform"
            style={{
              transform: `translateY(${offsetY}px)`,
              filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
            }}
          >
            <p
              className={`font-garamond font-semibold tracking-wide leading-tight transition-colors duration-200 ${
                isLocked
                  ? 'text-[#F1E6CF] text-lg md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                  : 'text-[#C6A15B]/85 text-base md:text-lg'
              }`}
            >
              {displayWord}
            </p>
          </div>

          {/* Status Gear Indicator on Top-Right */}
          <div className="absolute top-2 right-2 z-20 opacity-40">
            <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-[#C6A15B]' : 'bg-[#E57373] animate-ping'}`} />
          </div>
        </div>

        {/* Bottom subtle mechanical screw rivets */}
        <div className="px-3 py-1 bg-[#120D0F] border-t border-[#3D2C1A] flex items-center justify-between text-[9px] font-mono text-[#8E7036]">
          <span>REV-4</span>
          <span className="tracking-widest opacity-70">
            {isLocked ? 'LOCKED' : 'CYCLING'}
          </span>
          <span>{allWords.length} VAR</span>
        </div>
      </div>
    </div>
  );
};
