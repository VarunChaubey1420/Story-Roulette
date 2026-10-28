import React, { useState } from 'react';
import { SelectedPrompt, UserPreferences } from '../types';
import { CATEGORIES } from '../data/defaultWords';
import { Copy, Check, Sparkles, RotateCcw, X, Feather } from 'lucide-react';
import { sound } from '../utils/audio';

interface PromptRevealProps {
  prompt: SelectedPrompt;
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  preferences: UserPreferences;
}

export const PromptReveal: React.FC<PromptRevealProps> = ({
  prompt,
  isOpen,
  onClose,
  onReset,
  preferences,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copyFormat, setCopyFormat] = useState<'standard' | 'instagram'>('standard');

  if (!isOpen) return null;

  const getFormattedPrompt = (format: 'standard' | 'instagram') => {
    if (format === 'instagram') {
      return `✨ MINERVA PRESENTS: STORY ROULETTE ✨\n\nFate chooses the elements. You write the story.\n\n` +
        `📜 I. CHARACTER: ${prompt.character}\n` +
        `🌌 II. SETTING: ${prompt.setting}\n` +
        `🗝️ III. OBJECT: ${prompt.object}\n` +
        `📖 IV. GENRE: ${prompt.genre}\n\n` +
        `"${preferences.branding.secondaryQuote}"\n\n` +
        `What story would you write with these four elements? Drop your opening line below! 🖋️\n\n` +
        `#MinervaLiterary #StoryRoulette #WritingPrompts #CreativeWriting #WritersOfInstagram #Storytelling`;
    }

    return `MINERVA PRESENTS: STORY ROULETTE\n\nYOUR STORY BEGINS HERE\n\n` +
      `CHARACTER\n${prompt.character}\n\n` +
      `SETTING\n${prompt.setting}\n\n` +
      `OBJECT\n${prompt.object}\n\n` +
      `GENRE\n${prompt.genre}\n\n` +
      `"${preferences.branding.secondaryQuote}"`;
  };

  const handleCopy = (format: 'standard' | 'instagram' = copyFormat) => {
    const text = getFormattedPrompt(format);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      sound.playTick(1.5);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl p-6 sm:p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 border-[#C6A15B] animate-in zoom-in-95 duration-300"
        style={{
          background: 'radial-gradient(ellipse at 50% 10%, #351821 0%, #1A0F14 45%, #0F0A0D 100%)',
          boxShadow: '0 0 40px rgba(198, 161, 91, 0.25), inset 0 0 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#DFC38A] hover:bg-[#C6A15B]/20 transition-colors"
          title="Close prompt"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Antique Emblem & Heading */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#2A161C] border border-[#C6A15B] flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(198,161,91,0.3)]">
            <Feather className="w-6 h-6 text-[#DFC38A]" />
          </div>

          {preferences.branding.showMinerva && (
            <span className="font-cinzel text-xs tracking-[0.3em] text-[#C6A15B] uppercase font-bold mb-1">
              {preferences.branding.clubName}
            </span>
          )}

          <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#F1E6CF] tracking-wider mb-2">
            YOUR STORY BEGINS HERE
          </h2>

          <div className="flex items-center gap-3 w-full justify-center">
            <div className="h-[1px] flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#C6A15B]" />
            <Sparkles className="w-3.5 h-3.5 text-[#DFC38A]" />
            <div className="h-[1px] flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[#C6A15B]" />
          </div>
        </div>

        {/* 4 Selected Elements in Parchment Grid */}
        <div className="space-y-4 mb-7 text-left">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.key}
              className="relative p-3.5 sm:p-4 rounded-xl bg-[#140D10]/80 border border-[#795C37]/60 shadow-inner group hover:border-[#C6A15B]/80 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-cinzel text-xs font-bold text-[#C6A15B] tracking-widest flex items-center gap-1.5">
                  <span className="text-[#DFC38A]">{cat.numeral}.</span> {cat.label}
                </span>
                <span className="text-[10px] font-mono text-[#8E7036] uppercase tracking-wider">
                  ELECTED
                </span>
              </div>
              <p className="font-garamond text-xl sm:text-2xl text-[#FAF5EC] font-semibold tracking-wide drop-shadow">
                {prompt[cat.key]}
              </p>
            </div>
          ))}
        </div>

        {/* Philosophical Tagline */}
        <div className="mb-6 py-2 border-y border-[#5A3F26]/40">
          <p className="font-garamond italic text-[#D5C7AA] text-lg sm:text-xl">
            "{preferences.branding.secondaryQuote}"
          </p>
        </div>

        {/* Copy Format Selector */}
        <div className="flex items-center justify-center gap-2 mb-4 text-xs">
          <span className="text-[#8E7036]">Format:</span>
          <button
            onClick={() => setCopyFormat('standard')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              copyFormat === 'standard'
                ? 'bg-[#C6A15B] text-[#101010] font-bold shadow-md'
                : 'bg-[#2A171C] text-[#D5C7AA] hover:bg-[#3D2128]'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setCopyFormat('instagram')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              copyFormat === 'instagram'
                ? 'bg-[#C6A15B] text-[#101010] font-bold shadow-md'
                : 'bg-[#2A171C] text-[#D5C7AA] hover:bg-[#3D2128]'
            }`}
          >
            Instagram Reels Caption
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => handleCopy()}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#DFC38A] via-[#C6A15B] to-[#9A7A3E] text-[#120B0E] font-cinzel font-bold text-sm tracking-widest uppercase shadow-[0_4px_15px_rgba(198,161,91,0.35)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#120B0E]" />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#120B0E]" />
                <span>COPY PROMPT</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#201317] border border-[#795C37] text-[#D5C7AA] hover:text-[#FAF5EC] hover:border-[#C6A15B] font-cinzel text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET MACHINE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
