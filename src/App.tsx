import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  WordCollections, 
  SelectedPrompt, 
  UserPreferences, 
  CategoryKey, 
  PromptHistoryItem 
} from './types';
import { 
  DEFAULT_WORDS, 
  DEFAULT_PREFERENCES, 
  DURATION_MS, 
  CATEGORIES 
} from './data/defaultWords';
import { pickRandom, shuffleArray } from './utils/random';
import { sound } from './utils/audio';
import { AtmosphereParticles } from './components/AtmosphereParticles';
import { RouletteMachine } from './components/RouletteMachine';
import { MainControls } from './components/MainControls';
import { PromptReveal } from './components/PromptReveal';
import { RecordingView } from './components/RecordingView';
import { AdminPanel } from './components/AdminPanel';
import { PromptHistoryModal } from './components/PromptHistoryModal';
import { Sparkles, Feather, BookOpen, Library } from 'lucide-react';

const STORAGE_KEY_WORDS = 'minerva_story_roulette_words';
const STORAGE_KEY_PREFS = 'minerva_story_roulette_prefs';
const STORAGE_KEY_HIST = 'minerva_story_roulette_history';

export default function App() {
  // Load words from localStorage or use defaults
  const [words, setWords] = useState<WordCollections>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.character?.length >= 2 &&
          parsed.setting?.length >= 2 &&
          parsed.object?.length >= 2 &&
          parsed.genre?.length >= 2
        ) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_WORDS;
  });

  // Load preferences from localStorage or use defaults
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  // Load history from localStorage
  const [history, setHistory] = useState<PromptHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIST);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Current selected prompt items
  const [selectedPrompt, setSelectedPrompt] = useState<SelectedPrompt>(() => ({
    character: words.character[0] || 'An immortal poet',
    setting: words.setting[0] || 'An abandoned library',
    object: words.object[0] || 'An unsigned letter',
    genre: words.genre[0] || 'Psychological thriller',
  }));

  // Spin & Animation States
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasSpunOnce, setHasSpunOnce] = useState<boolean>(false);
  const [allReelsStopped, setAllReelsStopped] = useState<boolean>(false);
  const [stopDelays, setStopDelays] = useState<Record<CategoryKey, number>>({
    character: 5000,
    setting: 6000,
    object: 7000,
    genre: 8000,
  });

  // Modals & Mode States
  const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false);
  const [isRevealOpen, setIsRevealOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Completed reels counter during spin
  const stoppedCountRef = useRef<number>(0);
  const spinTimeoutRef = useRef<number | null>(null);

  // Sync sound settings to SoundEngine
  useEffect(() => {
    sound.setEnabled(preferences.soundEnabled);
    sound.setVolume(preferences.soundVolume);
  }, [preferences.soundEnabled, preferences.soundVolume]);

  // Persist words changes
  const handleUpdateWords = (newWords: WordCollections) => {
    setWords(newWords);
    try {
      localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(newWords));
    } catch {
      // Ignore
    }
  };

  // Persist preferences changes
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(newPrefs));
    } catch {
      // Ignore
    }
  };

  // Persist history changes
  const addToHistory = (prompt: SelectedPrompt) => {
    const newItem: PromptHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      prompt,
    };
    setHistory((prev) => {
      const next = [newItem, ...prev].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY_HIST, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HIST);
    } catch {
      // Ignore
    }
  };

  // Calculate spin delays based on duration preset and stop order
  const calculateStopDelays = useCallback(() => {
    const baseDuration = DURATION_MS[preferences.durationPreset];
    const delays: Record<CategoryKey, number> = {
      character: 0,
      setting: 0,
      object: 0,
      genre: 0,
    };

    if (preferences.stopOrder === 'sequential') {
      const step = baseDuration * 0.16;
      delays.character = Math.max(1500, baseDuration - step * 3);
      delays.setting = Math.max(2200, baseDuration - step * 2);
      delays.object = Math.max(2900, baseDuration - step * 1);
      delays.genre = baseDuration;
    } else {
      // Randomized stop sequence
      const order = shuffleArray<CategoryKey>(['character', 'setting', 'object', 'genre']);
      const step = baseDuration * 0.16;
      order.forEach((catKey, index) => {
        delays[catKey] = Math.max(1600, baseDuration - (3 - index) * step);
      });
    }

    return delays;
  }, [preferences.durationPreset, preferences.stopOrder]);

  // Main SPIN ALL trigger
  const handleSpinAll = useCallback(() => {
    if (isSpinning) return;

    sound.init();
    sound.playLever();

    // 1. Pick 4 truly random independent results from the collections
    const nextPrompt: SelectedPrompt = {
      character: pickRandom(words.character, selectedPrompt.character),
      setting: pickRandom(words.setting, selectedPrompt.setting),
      object: pickRandom(words.object, selectedPrompt.object),
      genre: pickRandom(words.genre, selectedPrompt.genre),
    };

    // Calculate timing for each reel
    const calculatedDelays = calculateStopDelays();
    setStopDelays(calculatedDelays);
    setSelectedPrompt(nextPrompt);

    // Reset counters and trigger spin state
    stoppedCountRef.current = 0;
    setAllReelsStopped(false);
    setIsSpinning(true);
    setHasSpunOnce(true);

    // Max timeout safety guard
    const maxDelay = Math.max(...Object.values(calculatedDelays)) + 1200;
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    spinTimeoutRef.current = window.setTimeout(() => {
      setIsSpinning(false);
      setAllReelsStopped(true);
    }, maxDelay);
  }, [isSpinning, words, selectedPrompt, calculateStopDelays]);

  // Handle each reel finishing its landing
  const handleReelStopped = (categoryKey: string, finalWord: string) => {
    stoppedCountRef.current += 1;

    // Check if all 4 reels have settled
    if (stoppedCountRef.current >= 4) {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      setIsSpinning(false);
      setAllReelsStopped(true);

      // Add to prompt history
      addToHistory(selectedPrompt);

      // Play triumphant antique chord
      setTimeout(() => {
        sound.playReveal();
      }, 300);

      // If auto-reveal is active in desktop mode and not recording mode, can open prompt
      if (preferences.recording.autoRevealAfterStop && !isRecordingMode) {
        setTimeout(() => {
          setIsRevealOpen(true);
        }, 800);
      }
    }
  };

  // Reset to initial ready state
  const handleReset = () => {
    if (isSpinning) return;
    sound.playTick(0.8);
    setAllReelsStopped(false);
    setHasSpunOnce(false);
    setIsRevealOpen(false);
  };

  // Copy prompt helper for main controls
  const handleCopyPrompt = () => {
    const text = `MINERVA PRESENTS: STORY ROULETTE\n\nYOUR STORY BEGINS HERE\n\n` +
      `I. CHARACTER: ${selectedPrompt.character}\n` +
      `II. SETTING: ${selectedPrompt.setting}\n` +
      `III. OBJECT: ${selectedPrompt.object}\n` +
      `IV. GENRE: ${selectedPrompt.genre}\n\n` +
      `"${preferences.branding.secondaryQuote}"`;

    navigator.clipboard.writeText(text);
    sound.playTick(1.3);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !preferences.soundEnabled;
    handleUpdatePreferences({
      ...preferences,
      soundEnabled: nextState,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0709] text-[#F1E6CF] relative overflow-x-hidden flex flex-col justify-between selection:bg-[#C6A15B]/40 selection:text-[#FFF1D0]">
      {/* Ambient Floating Dust Particles */}
      <AtmosphereParticles enabled={preferences.particlesEnabled} />

      {/* Atmospheric Vignette and Lighting Layers */}
      <div className="fixed inset-0 bg-vignette pointer-events-none z-0" />
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(198, 161, 91, 0.25) 0%, transparent 60%)',
        }}
      />

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* HEADER SECTION */}
        <header className="text-center pt-2 sm:pt-4 pb-2 w-full max-w-3xl">
          {preferences.branding.showMinerva && (
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#C6A15B]/70" />
              <div className="flex items-center gap-1.5 text-[#DFC38A]">
                <Library className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span className="font-cinzel text-xs sm:text-sm font-bold tracking-[0.35em] uppercase">
                  {preferences.branding.clubName}
                </span>
                <Library className="w-3.5 h-3.5 text-[#C6A15B]" />
              </div>
              <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#C6A15B]/70" />
            </div>
          )}

          <h1 className="font-cinzel-dec text-3xl sm:text-5xl lg:text-6xl font-black tracking-wider uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] my-1">
            <span className="gold-gradient-text">STORY ROULETTE</span>
          </h1>

          <p className="font-garamond italic text-base sm:text-xl text-[#D5C7AA] max-w-xl mx-auto mt-2 tracking-wide font-normal">
            "{preferences.branding.tagline}"
          </p>

          <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
            <div className="h-[1px] w-16 bg-[#C6A15B]/50" />
            <Sparkles className="w-3 h-3 text-[#DFC38A]" />
            <div className="h-[1px] w-16 bg-[#C6A15B]/50" />
          </div>
        </header>

        {/* CENTER MECHANICAL ROULETTE MACHINE */}
        <section className="w-full flex-1 flex flex-col items-center justify-center my-2">
          <RouletteMachine
            words={words}
            selectedPrompt={selectedPrompt}
            isSpinning={isSpinning}
            stopDelays={stopDelays}
            onReelStopped={handleReelStopped}
          />
        </section>

        {/* PRIMARY CONTROLS BAR */}
        <section className="w-full">
          <MainControls
            isSpinning={isSpinning}
            hasSpunOnce={hasSpunOnce}
            allReelsStopped={allReelsStopped}
            onSpinAll={handleSpinAll}
            onEnterRecordingMode={() => setIsRecordingMode(true)}
            onRevealPrompt={() => setIsRevealOpen(true)}
            onCopyPrompt={handleCopyPrompt}
            onReset={handleReset}
            onOpenSettings={() => setIsAdminOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            soundEnabled={preferences.soundEnabled}
            onToggleSound={handleToggleSound}
          />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-4 px-6 border-t border-[#3D281D]/60 bg-[#0C080A]/80 backdrop-blur-sm text-center text-xs font-mono text-[#8E7036] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Feather className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span className="font-cinzel text-[#DFC38A] tracking-wider">
            MINERVA LITERARY CLUB
          </span>
          <span className="opacity-50">•</span>
          <span>CAMPUS CREATIVE WRITING ARCHIVE</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>RECORDING PRESET: <strong className="text-[#DFC38A]">{preferences.durationPreset.toUpperCase()}</strong></span>
          <span className="opacity-50">•</span>
          <button
            onClick={() => setIsRecordingMode(true)}
            className="text-[#DFC38A] hover:underline cursor-pointer"
          >
            Launch 9:16 Instagram Reel Mode
          </button>
        </div>
      </footer>

      {/* RECORDING MODE MODAL VIEW (9:16) */}
      {isRecordingMode && (
        <RecordingView
          words={words}
          selectedPrompt={selectedPrompt}
          isSpinning={isSpinning}
          stopDelays={stopDelays}
          onReelStopped={handleReelStopped}
          onSpin={handleSpinAll}
          onReset={handleReset}
          onExit={() => setIsRecordingMode(false)}
          preferences={preferences}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* PROMPT REVEAL ILLUMINATED DECREE MODAL */}
      <PromptReveal
        prompt={selectedPrompt}
        isOpen={isRevealOpen}
        onClose={() => setIsRevealOpen(false)}
        onReset={handleReset}
        preferences={preferences}
      />

      {/* ADMIN & CUSTOMIZATION PANEL */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        words={words}
        onUpdateWords={handleUpdateWords}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
      />

      {/* HISTORY MODAL */}
      <PromptHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectPrompt={(loadedPrompt) => {
          setSelectedPrompt(loadedPrompt);
          setAllReelsStopped(true);
          setHasSpunOnce(true);
        }}
      />
    </div>
  );
}
