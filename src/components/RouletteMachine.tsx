import React from 'react';
import { CATEGORIES } from '../data/defaultWords';
import { CategoryKey, WordCollections, SelectedPrompt } from '../types';
import { Reel } from './Reel';

interface RouletteMachineProps {
  words: WordCollections;
  selectedPrompt: SelectedPrompt;
  isSpinning: boolean;
  stopDelays: Record<CategoryKey, number>;
  onReelStopped: (categoryKey: string, word: string) => void;
  isCompact?: boolean;
}

export const RouletteMachine: React.FC<RouletteMachineProps> = ({
  words,
  selectedPrompt,
  isSpinning,
  stopDelays,
  onReelStopped,
  isCompact = false,
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto my-4 transition-all duration-300">
      {/* Outer Mechanical Apparatus Casing */}
      <div 
        className="relative rounded-2xl p-4 sm:p-6 lg:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, #2D141B 0%, #170E12 55%, #0D090B 100%)',
          border: '3px solid #795C37',
          boxShadow: '0 0 0 2px #2A1A12, 0 15px 40px rgba(0,0,0,0.95), inset 0 2px 5px rgba(223,195,138,0.25), inset 0 -4px 10px rgba(0,0,0,0.85)',
        }}
      >
        {/* Antique Corner Brass Brackets */}
        <div className="absolute top-2 left-2 flex gap-1">
          <div className="rivet" />
          <div className="rivet" />
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="rivet" />
          <div className="rivet" />
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1">
          <div className="rivet" />
          <div className="rivet" />
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          <div className="rivet" />
          <div className="rivet" />
        </div>

        {/* Vintage Top Apparatus Nameplate */}
        <div className="relative flex flex-col items-center justify-center pb-5 mb-4 border-b border-[#5A3F26]/60">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block h-[1px] w-16 bg-gradient-to-r from-transparent to-[#C6A15B]/70" />
            
            <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#1A1215] border border-[#C6A15B]/30 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFC38A] animate-pulse" />
              <span className="font-cinzel text-[11px] tracking-[0.25em] text-[#DFC38A] uppercase font-semibold">
                CHRONO-NARRATIVE ENGINE • MODEL M-IV
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFC38A] animate-pulse" />
            </div>

            <div className="hidden sm:block h-[1px] w-16 bg-gradient-to-l from-transparent to-[#C6A15B]/70" />
          </div>

          <div className="text-[10px] font-mono text-[#8E7036] tracking-widest mt-1">
            EST. MINERVA ARCHIVES • FOUR-FOLD SYNTHESIS
          </div>
        </div>

        {/* 4 Reels Layout Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3 relative z-10">
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
                  onStopped={onReelStopped}
                  isCompact={isCompact}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Vintage Brass Base & Meter Readings */}
        <div className="mt-5 pt-4 border-t border-[#4D361F]/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#A88C52]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[#8E7036]">STATUS:</span>
              <span className={`font-semibold tracking-wider ${isSpinning ? 'text-[#DFC38A] animate-pulse' : 'text-[#709E64]'}`}>
                {isSpinning ? 'SPINNING ARCHIVES...' : 'EQUILIBRIUM REACHED'}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-[#8E7036]">
              <span>TOTAL COMBINATIONS:</span>
              <span className="text-[#F1E6CF] font-semibold">
                {(
                  (words.character.length || 1) *
                  (words.setting.length || 1) *
                  (words.object.length || 1) *
                  (words.genre.length || 1)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C6A15B]/60" />
            <span className="text-[11px] font-cinzel tracking-wider text-[#DFC38A]">
              MINERVA LITERARY CLUB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
