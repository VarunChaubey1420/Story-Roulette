/**
 * Story Roulette Type Definitions
 * Minerva Literary Club
 */

export type CategoryKey = 'character' | 'setting' | 'object' | 'genre';

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  numeral: string;
  iconName: string;
  accentColor: string;
}

export type WordCollections = Record<CategoryKey, string[]>;

export type SelectedPrompt = Record<CategoryKey, string>;

export type DurationPreset = 'quick' | 'cinematic' | 'epic';

export type ReelStopOrder = 'sequential' | 'randomized';

export interface UserPreferences {
  durationPreset: DurationPreset;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  particlesEnabled: boolean;
  stopOrder: ReelStopOrder;
  branding: {
    showMinerva: boolean;
    clubName: string;
    tagline: string;
    secondaryQuote: string;
  };
  recording: {
    enableCountdown: boolean;
    countdownSeconds: 3 | 5 | 10;
    autoRevealAfterStop: boolean;
    showSafeGuides: boolean;
  };
}

export interface ReelState {
  isSpinning: boolean;
  isStopping: boolean;
  isLocked: boolean;
  currentWord: string;
  highlightPulse: boolean;
}

export interface PromptHistoryItem {
  id: string;
  timestamp: number;
  prompt: SelectedPrompt;
}
