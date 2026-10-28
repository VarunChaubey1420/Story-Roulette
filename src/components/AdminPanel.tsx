import React, { useState } from 'react';
import { WordCollections, UserPreferences, CategoryKey, DurationPreset, ReelStopOrder } from '../types';
import { CATEGORIES, DEFAULT_WORDS } from '../data/defaultWords';
import { 
  X, 
  Settings, 
  BookOpen, 
  Sliders, 
  Sparkles, 
  Video, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  Check, 
  AlertCircle,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { sound } from '../utils/audio';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordCollections;
  onUpdateWords: (newWords: WordCollections) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
}

type TabType = 'words' | 'machine' | 'branding' | 'recording';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  words,
  onUpdateWords,
  preferences,
  onUpdatePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('words');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('character');
  const [newWordInput, setNewWordInput] = useState<string>('');
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null);
  const [editingWordValue, setEditingWordValue] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Local draft of preferences
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);

  if (!isOpen) return null;

  // Add new word to current category
  const handleAddWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newWordInput.trim();
    if (!trimmed) return;

    if (words[selectedCategory].includes(trimmed)) {
      setValidationError('This phrase already exists in this category.');
      return;
    }

    const updated = {
      ...words,
      [selectedCategory]: [...words[selectedCategory], trimmed],
    };

    onUpdateWords(updated);
    setNewWordInput('');
    setValidationError(null);
    sound.playTick(1.2);
  };

  // Remove word
  const handleRemoveWord = (index: number) => {
    if (words[selectedCategory].length <= 2) {
      setValidationError('Each category must have at least 2 entries.');
      return;
    }

    const updated = {
      ...words,
      [selectedCategory]: words[selectedCategory].filter((_, i) => i !== index),
    };

    onUpdateWords(updated);
    setValidationError(null);
    sound.playTick(0.8);
  };

  // Save inline edit
  const handleSaveEdit = (index: number) => {
    const trimmed = editingWordValue.trim();
    if (!trimmed) return;

    const list = [...words[selectedCategory]];
    list[index] = trimmed;

    const updated = {
      ...words,
      [selectedCategory]: list,
    };

    onUpdateWords(updated);
    setEditingWordIndex(null);
    setValidationError(null);
  };

  const [showConfirmRestore, setShowConfirmRestore] = useState<boolean>(false);

  // Reset category or all words to default
  const handleRestoreDefaults = () => {
    onUpdateWords(DEFAULT_WORDS);
    setValidationError(null);
    setShowConfirmRestore(false);
    sound.playTick(1.0);
  };

  // Update preferences helper
  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const updated = { ...localPrefs, [key]: value };
    setLocalPrefs(updated);
    onUpdatePreferences(updated);

    if (key === 'soundEnabled') {
      sound.setEnabled(value as boolean);
    }
    if (key === 'soundVolume') {
      sound.setVolume(value as number);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border-2 border-[#795C37] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1A1014 0%, #120A0E 100%)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#23141A] border-b border-[#5A3F26] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3D2028] border border-[#C6A15B]/40 text-[#DFC38A]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#F1E6CF] tracking-wider">
                MACHINE CONFIGURATION & ARCHIVES
              </h2>
              <p className="text-xs text-[#A88C52]">
                Custom prompts, animation physics, branding, and Instagram reel recording
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#C6A15B] hover:bg-[#3D2028] transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#3D2A1C] bg-[#140C10] px-6 gap-2 sm:gap-4 overflow-x-auto">
          {[
            { id: 'words', label: 'Word Archives', icon: BookOpen },
            { id: 'machine', label: 'Machine Physics', icon: Sliders },
            { id: 'branding', label: 'Branding & Copy', icon: Sparkles },
            { id: 'recording', label: 'Recording Mode', icon: Video },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setValidationError(null);
                }}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-cinzel text-xs font-semibold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#DFC38A] text-[#DFC38A] bg-[#2A171F]/50'
                    : 'border-transparent text-[#9E8560] hover:text-[#D5C7AA]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: WORD ARCHIVES */}
          {activeTab === 'words' && (
            <div className="space-y-5">
              {/* Category Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSel = selectedCategory === cat.key;
                  const count = words[cat.key]?.length || 0;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        setEditingWordIndex(null);
                        setValidationError(null);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-[#351922] border-[#DFC38A] shadow-[0_0_15px_rgba(223,195,138,0.2)]'
                          : 'bg-[#180E13] border-[#4A3420] hover:border-[#795C37]'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-[#8E7036]">{cat.numeral}</div>
                      <div className="font-cinzel text-xs font-bold text-[#F1E6CF]">{cat.label}</div>
                      <div className="text-[11px] text-[#A88C52] mt-0.5">{count} entries</div>
                    </button>
                  );
                })}
              </div>

              {/* Add New Word Form */}
              <form onSubmit={handleAddWord} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add a new ${selectedCategory} prompt...`}
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#140C10] border border-[#5A3F26] text-[#F1E6CF] placeholder-[#795C37] focus:outline-none focus:border-[#DFC38A] text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#C6A15B] hover:bg-[#DFC38A] text-[#120B0E] font-cinzel font-bold text-xs tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD</span>
                </button>
              </form>

              {validationError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Word List Items */}
              <div className="border border-[#4A3420] rounded-xl bg-[#120A0E] overflow-hidden">
                <div className="px-4 py-2 bg-[#1E1116] border-b border-[#4A3420] flex items-center justify-between text-xs text-[#8E7036] font-mono">
                  <span>ENTRIES ({words[selectedCategory].length})</span>
                  <span>CLICK TEXT TO EDIT</span>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-[#2B1B15]">
                  {words[selectedCategory].map((word, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-[#201217] transition-colors group"
                    >
                      {editingWordIndex === idx ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingWordValue}
                            onChange={(e) => setEditingWordValue(e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded bg-[#0F080C] border border-[#DFC38A] text-[#F1E6CF] text-sm focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(idx);
                              if (e.key === 'Escape') setEditingWordIndex(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveEdit(idx)}
                            className="p-1 rounded bg-[#C6A15B] text-[#120B0E] hover:bg-[#DFC38A]"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingWordIndex(null)}
                            className="p-1 rounded bg-[#3D2028] text-[#D5C7AA]"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            onClick={() => {
                              setEditingWordIndex(idx);
                              setEditingWordValue(word);
                            }}
                            className="flex-1 font-garamond text-base text-[#FAF5EC] cursor-pointer hover:text-[#DFC38A] transition-colors"
                            title="Click to edit phrase"
                          >
                            {word}
                          </span>

                          <button
                            onClick={() => handleRemoveWord(idx)}
                            className="opacity-40 group-hover:opacity-100 p-1.5 rounded hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                            title="Remove this entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Restore Defaults Button with In-UI Confirmation */}
              <div className="pt-2 flex justify-end">
                {showConfirmRestore ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#2A161C] border border-[#DFC38A]">
                    <span className="text-xs text-[#DFC38A]">Reset all 4 categories to defaults?</span>
                    <button
                      onClick={handleRestoreDefaults}
                      className="px-2.5 py-1 rounded bg-[#C6A15B] text-[#120B0E] font-bold text-xs hover:bg-[#DFC38A] cursor-pointer"
                    >
                      Yes, Reset
                    </button>
                    <button
                      onClick={() => setShowConfirmRestore(false)}
                      className="px-2.5 py-1 rounded bg-[#180E13] text-[#D5C7AA] text-xs hover:bg-[#201217] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmRestore(true)}
                    className="px-3 py-1.5 rounded-lg border border-[#795C37] text-xs text-[#C6A15B] hover:bg-[#2A161C] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Default Word Collections</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MACHINE SETTINGS */}
          {activeTab === 'machine' && (
            <div className="space-y-6">
              {/* Duration Presets */}
              <div className="p-4 rounded-xl bg-[#140C10] border border-[#4A3420] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-cinzel text-sm font-bold text-[#F1E6CF]">
                      REEL SPIN DURATION
                    </h3>
                    <p className="text-xs text-[#8E7036]">
                      Pacing and suspense curve for screen recordings
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-[#C6A15B]" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'quick', label: 'QUICK', time: '~4s', desc: 'Fast turnaround' },
                    { id: 'cinematic', label: 'CINEMATIC', time: '~8s (Default)', desc: 'Optimal suspense' },
                    { id: 'epic', label: 'EPIC', time: '~12s', desc: 'Grand reel pacing' },
                  ].map((preset) => {
                    const isSel = localPrefs.durationPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => updatePref('durationPreset', preset.id as DurationPreset)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#351922] border-[#DFC38A] shadow-[0_0_15px_rgba(223,195,138,0.2)]'
                            : 'bg-[#190E14] border-[#4A3420] hover:border-[#795C37]'
                        }`}
                      >
                        <div className="font-cinzel text-xs font-bold text-[#F1E6CF]">{preset.label}</div>
                        <div className="text-[11px] font-mono text-[#DFC38A] mt-0.5">{preset.time}</div>
                        <div className="text-[10px] text-[#8E7036] mt-1">{preset.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stop Order Mode */}
              <div className="p-4 rounded-xl bg-[#140C10] border border-[#4A3420] space-y-3">
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-[#F1E6CF]">
                    REEL STOP SEQUENCE
                  </h3>
                  <p className="text-xs text-[#8E7036]">
                    Order in which the 4 reels conclude their spin
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updatePref('stopOrder', 'sequential')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      localPrefs.stopOrder === 'sequential'
                        ? 'bg-[#351922] border-[#DFC38A]'
                        : 'bg-[#190E14] border-[#4A3420] hover:border-[#795C37]'
                    }`}
                  >
                    <div className="font-cinzel text-xs font-bold text-[#F1E6CF]">
                      SEQUENTIAL (I → IV)
                    </div>
                    <div className="text-[11px] text-[#8E7036] mt-1">
                      Stops Character, then Setting, then Object, then Genre.
                    </div>
                  </button>

                  <button
                    onClick={() => updatePref('stopOrder', 'randomized')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      localPrefs.stopOrder === 'randomized'
                        ? 'bg-[#351922] border-[#DFC38A]'
                        : 'bg-[#190E14] border-[#4A3420] hover:border-[#795C37]'
                    }`}
                  >
                    <div className="font-cinzel text-xs font-bold text-[#F1E6CF]">
                      RANDOMIZED REELS
                    </div>
                    <div className="text-[11px] text-[#8E7036] mt-1">
                      Random reel stops first, keeping the viewer guessing.
                    </div>
                  </button>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="p-4 rounded-xl bg-[#140C10] border border-[#4A3420] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-cinzel text-sm font-bold text-[#F1E6CF]">
                      MECHANICAL SOUND EFFECTS
                    </h3>
                    <p className="text-xs text-[#8E7036]">
                      Web Audio synthesized gear ticks, lock clacks, and antique chord
                    </p>
                  </div>
                  <button
                    onClick={() => updatePref('soundEnabled', !localPrefs.soundEnabled)}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      localPrefs.soundEnabled
                        ? 'bg-[#3D2028] border-[#DFC38A] text-[#DFC38A]'
                        : 'bg-[#190E14] border-[#4A3420] text-[#795C37]'
                    }`}
                  >
                    {localPrefs.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                {localPrefs.soundEnabled && (
                  <div>
                    <div className="flex justify-between text-xs font-mono text-[#8E7036] mb-1">
                      <span>SYNTHESIZER VOLUME</span>
                      <span>{Math.round(localPrefs.soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={localPrefs.soundVolume}
                      onChange={(e) => updatePref('soundVolume', parseFloat(e.target.value))}
                      className="w-full accent-[#DFC38A] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Atmospheric Floating Motes */}
              <div className="p-4 rounded-xl bg-[#140C10] border border-[#4A3420] flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-[#F1E6CF]">
                    ATMOSPHERIC DUST MOTES
                  </h3>
                  <p className="text-xs text-[#8E7036]">
                    Floating golden library dust particles in background
                  </p>
                </div>
                <button
                  onClick={() => updatePref('particlesEnabled', !localPrefs.particlesEnabled)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-cinzel font-bold cursor-pointer transition-colors ${
                    localPrefs.particlesEnabled
                      ? 'bg-[#351922] border-[#DFC38A] text-[#DFC38A]'
                      : 'bg-[#190E14] border-[#4A3420] text-[#795C37]'
                  }`}
                >
                  {localPrefs.particlesEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BRANDING & COPY */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#140C10] border border-[#4A3420] flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-[#F1E6CF]">
                    DISPLAY CLUB BRANDING
                  </h3>
                  <p className="text-xs text-[#8E7036]">
                    Show or hide the Minerva prefix banner
                  </p>
                </div>
                <button
                  onClick={() =>
                    updatePref('branding', {
                      ...localPrefs.branding,
                      showMinerva: !localPrefs.branding.showMinerva,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-cinzel font-bold cursor-pointer transition-colors ${
                    localPrefs.branding.showMinerva
                      ? 'bg-[#351922] border-[#DFC38A] text-[#DFC38A]'
                      : 'bg-[#190E14] border-[#4A3420] text-[#795C37]'
                  }`}
                >
                  {localPrefs.branding.showMinerva ? 'VISIBLE' : 'HIDDEN'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-cinzel font-semibold text-[#C6A15B] mb-1">
                    CLUB HEADER TEXT
                  </label>
                  <input
                    type="text"
                    value={localPrefs.branding.clubName}
                    onChange={(e) =>
                      updatePref('branding', {
                        ...localPrefs.branding,
                        clubName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140C10] border border-[#5A3F26] text-[#F1E6CF] text-sm focus:border-[#DFC38A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel font-semibold text-[#C6A15B] mb-1">
                    PRIMARY TAGLINE
                  </label>
                  <input
                    type="text"
                    value={localPrefs.branding.tagline}
                    onChange={(e) =>
                      updatePref('branding', {
                        ...localPrefs.branding,
                        tagline: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140C10] border border-[#5A3F26] text-[#F1E6CF] text-sm focus:border-[#DFC38A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel font-semibold text-[#C6A15B] mb-1">
                    SECONDARY REVEAL QUOTE
                  </label>
                  <input
                    type="text"
                    value={localPrefs.branding.secondaryQuote}
                    onChange={(e) =>
                      updatePref('branding', {
                        ...localPrefs.branding,
                        secondaryQuote: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140C10] border border-[#5A3F26] text-[#F1E6CF] text-sm focus:border-[#DFC38A] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECORDING MODE SETTINGS */}
          {activeTab === 'recording' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#140C10] border border-[#4A3420] flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-[#F1E6CF]">
                    AUTO-SPIN COUNTDOWN
                  </h3>
                  <p className="text-xs text-[#8E7036]">
                    Gives you time after pressing screen record before reels start
                  </p>
                </div>
                <button
                  onClick={() =>
                    updatePref('recording', {
                      ...localPrefs.recording,
                      enableCountdown: !localPrefs.recording.enableCountdown,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-cinzel font-bold cursor-pointer transition-colors ${
                    localPrefs.recording.enableCountdown
                      ? 'bg-[#351922] border-[#DFC38A] text-[#DFC38A]'
                      : 'bg-[#190E14] border-[#4A3420] text-[#795C37]'
                  }`}
                >
                  {localPrefs.recording.enableCountdown ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {localPrefs.recording.enableCountdown && (
                <div className="space-y-2">
                  <label className="block text-xs font-cinzel font-semibold text-[#C6A15B]">
                    COUNTDOWN DURATION
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[3, 5, 10].map((sec) => {
                      const isSel = localPrefs.recording.countdownSeconds === sec;
                      return (
                        <button
                          key={sec}
                          onClick={() =>
                            updatePref('recording', {
                              ...localPrefs.recording,
                              countdownSeconds: sec as 3 | 5 | 10,
                            })
                          }
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#351922] border-[#DFC38A]'
                              : 'bg-[#190E14] border-[#4A3420] hover:border-[#795C37]'
                          }`}
                        >
                          <span className="font-cinzel text-base font-bold text-[#F1E6CF]">{sec} SECONDS</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#140C10] border border-[#4A3420] flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-[#F1E6CF]">
                    AUTOMATIC AUDIO CHORD ON COMPLETION
                  </h3>
                  <p className="text-xs text-[#8E7036]">
                    Play triumphant antique chord immediately when all reels stop
                  </p>
                </div>
                <button
                  onClick={() =>
                    updatePref('recording', {
                      ...localPrefs.recording,
                      autoRevealAfterStop: !localPrefs.recording.autoRevealAfterStop,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-cinzel font-bold cursor-pointer transition-colors ${
                    localPrefs.recording.autoRevealAfterStop
                      ? 'bg-[#351922] border-[#DFC38A] text-[#DFC38A]'
                      : 'bg-[#190E14] border-[#4A3420] text-[#795C37]'
                  }`}
                >
                  {localPrefs.recording.autoRevealAfterStop ? 'YES' : 'NO'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#180E13] border-t border-[#4A3420] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Saved to Local Storage
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DFC38A] to-[#C6A15B] text-[#120B0E] font-cinzel font-bold text-xs tracking-widest uppercase shadow-md cursor-pointer hover:brightness-110"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
