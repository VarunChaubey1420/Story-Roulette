import React, { useState } from 'react';
import { PromptHistoryItem } from '../types';
import { X, History, Trash2, Copy, Check, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface PromptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptHistoryItem[];
  onClearHistory: () => void;
  onSelectPrompt: (prompt: PromptHistoryItem['prompt']) => void;
}

export const PromptHistoryModal: React.FC<PromptHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectPrompt,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (item: PromptHistoryItem) => {
    const text = `MINERVA PRESENTS: STORY ROULETTE\n\n` +
      `I. CHARACTER: ${item.prompt.character}\n` +
      `II. SETTING: ${item.prompt.setting}\n` +
      `III. OBJECT: ${item.prompt.object}\n` +
      `IV. GENRE: ${item.prompt.genre}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id);
      sound.playTick(1.4);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border-2 border-[#795C37] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1A1014 0%, #120A0E 100%)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#23141A] border-b border-[#5A3F26] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3D2028] border border-[#C6A15B]/40 text-[#DFC38A]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#F1E6CF] tracking-wider">
                CHRONICLED PROMPTS
              </h2>
              <p className="text-xs text-[#A88C52]">
                Recently generated literary combinations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#C6A15B] hover:bg-[#3D2028] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.length === 0 ? (
            <div className="py-12 text-center text-[#8E7036] space-y-2">
              <Sparkles className="w-8 h-8 mx-auto opacity-40 text-[#C6A15B]" />
              <p className="font-cinzel text-sm">No chronicles recorded yet.</p>
              <p className="text-xs text-stone-500">Spin the roulette to forge your first story prompt.</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div 
                key={item.id}
                className="p-4 rounded-xl bg-[#140C10] border border-[#4A3420] hover:border-[#795C37] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs text-[#8E7036] font-mono border-b border-[#2A1813] pb-2">
                  <span>PROMPT #{history.length - idx}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-cinzel text-[#C6A15B] font-bold mr-1.5">I. CHARACTER:</span>
                    <span className="font-garamond text-sm text-[#F1E6CF]">{item.prompt.character}</span>
                  </div>
                  <div>
                    <span className="font-cinzel text-[#C6A15B] font-bold mr-1.5">II. SETTING:</span>
                    <span className="font-garamond text-sm text-[#F1E6CF]">{item.prompt.setting}</span>
                  </div>
                  <div>
                    <span className="font-cinzel text-[#C6A15B] font-bold mr-1.5">III. OBJECT:</span>
                    <span className="font-garamond text-sm text-[#F1E6CF]">{item.prompt.object}</span>
                  </div>
                  <div>
                    <span className="font-cinzel text-[#C6A15B] font-bold mr-1.5">IV. GENRE:</span>
                    <span className="font-garamond text-sm text-[#F1E6CF]">{item.prompt.genre}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      onSelectPrompt(item.prompt);
                      onClose();
                    }}
                    className="px-3 py-1 rounded bg-[#2D161E] hover:bg-[#3D2028] text-xs font-cinzel text-[#DFC38A] border border-[#5A3F26] cursor-pointer"
                  >
                    LOAD INTO REELS
                  </button>
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded bg-[#2D161E] hover:bg-[#3D2028] text-xs text-[#DFC38A] border border-[#5A3F26] cursor-pointer"
                    title="Copy Prompt"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="px-6 py-3 bg-[#180E13] border-t border-[#4A3420] flex justify-between items-center text-xs">
            <span className="text-[#8E7036] font-mono">{history.length} Prompts Logged</span>
            <button
              onClick={onClearHistory}
              className="text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
