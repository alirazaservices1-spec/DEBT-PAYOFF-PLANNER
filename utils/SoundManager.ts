// ─── SoundManager — expo-av based audio for React Native + Web ────────────────
// Preloads all WAV files at app start for zero-delay playback.
// Persists enabled/disabled preference to AsyncStorage.
// Special: debt_paid_off bypasses iOS silent mode.

import { Audio } from "expo-av";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOUND_ENABLED_KEY = "@debtpath_sound_enabled";
const DEX_VOCAL_KEY = "@debtpath_dex_vocal_enabled";

export type SoundEvent =
  | "payment_logged"
  | "xp_earned"
  | "streak_maintained"
  | "level_up"
  | "milestone"
  | "streak_at_risk"
  | "variable_bonus"
  | "interest_saved"
  | "debt_paid_off"
  | "dex_approval"
  | "dex_concern"
  | "dex_surprise";

const GROUP_SMALL = [
  require("../assets/sounds/All_sounds/yes.mp3"),
  require("../assets/sounds/All_sounds/Boom.mp3"),
  require("../assets/sounds/All_sounds/nice.mp3"),
  require("../assets/sounds/All_sounds/chac-ching.mp3"),
  require("../assets/sounds/All_sounds/Nailed i.mp3"),
  require("../assets/sounds/All_sounds/Ka-pow.mp3"),
  require("../assets/sounds/All_sounds/Bam.mp3"),
  require("../assets/sounds/All_sounds/Got it.mp3"),
  require("../assets/sounds/All_sounds/Done.mp3"),
  require("../assets/sounds/All_sounds/Let's go.mp3"),
  require("../assets/sounds/All_sounds/Pow.mp3"),
  require("../assets/sounds/All_sounds/Crushed it.mp3"),
  require("../assets/sounds/All_sounds/Money.mp3"),
  require("../assets/sounds/All_sounds/Sharp.mp3"),
  require("../assets/sounds/All_sounds/Locked in.mp3"),
] as const;

const GROUP_MEDIUM = [
  require("../assets/sounds/All_sounds/You're on fire.mp3"),
  require("../assets/sounds/All_sounds/Keep it up.mp3"),
  require("../assets/sounds/All_sounds/Way to go.mp3"),
  require("../assets/sounds/All_sounds/Dex is proud.mp3"),
  require("../assets/sounds/All_sounds/Nothing stops you.mp3"),
  require("../assets/sounds/All_sounds/Streak machine.mp3"),
  require("../assets/sounds/All_sounds/Goals? Smashed.mp3"),
  require("../assets/sounds/All_sounds/What a day.mp3"),
  require("../assets/sounds/All_sounds/Pure discipline.mp3"),
  require("../assets/sounds/All_sounds/That's momentum.mp3"),
  require("../assets/sounds/All_sounds/Unstoppable force.mp3"),
  require("../assets/sounds/All_sounds/In the zone.mp3"),
] as const;

const GROUP_BIG = [
  require("../assets/sounds/All_sounds/You paid it off.mp3"),
  require("../assets/sounds/All_sounds/That debt is gone.mp3"),
  require("../assets/sounds/All_sounds/Look how far you've come.mp3"),
  require("../assets/sounds/All_sounds/You changed your life.mp3"),
  require("../assets/sounds/All_sounds/Freedom feels so good.mp3"),
  require("../assets/sounds/All_sounds/You did the impossible.mp3"),
  require("../assets/sounds/All_sounds/Ring the bell baby.mp3"),
  require("../assets/sounds/All_sounds/Take a bow champion.mp3"),
  require("../assets/sounds/All_sounds/Debt free feels amazing.mp3"),
  require("../assets/sounds/All_sounds/You're a legend now.mp3"),
  require("../assets/sounds/All_sounds/Standing ovation for you.mp3"),
  require("../assets/sounds/All_sounds/History in the making.mp3"),
] as const;

const EVENT_GROUP_MAP: Record<SoundEvent, "small" | "medium" | "big"> = {
  payment_logged: "small",
  xp_earned: "small",
  streak_maintained: "small",
  streak_at_risk: "small",
  variable_bonus: "medium",
  interest_saved: "medium",
  level_up: "medium",
  milestone: "medium",
  debt_paid_off: "big",
  dex_approval: "medium",
  dex_concern: "medium",
  dex_surprise: "medium",
};

export type DexVocalType = "approval" | "concern" | "surprise";
const DEX_VOCAL_MAP: Record<DexVocalType, SoundEvent> = {
  approval: "dex_approval",
  concern: "dex_concern",
  surprise: "dex_surprise",
};

class SoundManager {
  private soundsByFile: Partial<Record<number, Audio.Sound>> = {};
  private enabled: boolean = true;
  private dexVocalEnabled: boolean = true;
  private loaded: boolean = false;
  private playLock: Promise<void> = Promise.resolve();
  private isPlaying = false;
  private playRequestInFlight = false;
  private lastStartedAtMs = 0;
  private readonly minGapMs = 220;
  private playbackWatchdog: ReturnType<typeof setTimeout> | null = null;
  private readonly maxClipMs = 7000;

  private clearWatchdog(): void {
    if (this.playbackWatchdog) {
      clearTimeout(this.playbackWatchdog);
      this.playbackWatchdog = null;
    }
  }

  private unlockPlaybackState(): void {
    this.isPlaying = false;
    this.playRequestInFlight = false;
    this.clearWatchdog();
  }

  private pickRandomFile(name: SoundEvent): number {
    const tier = EVENT_GROUP_MAP[name];
    const pool = tier === "big" ? GROUP_BIG : tier === "medium" ? GROUP_MEDIUM : GROUP_SMALL;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private getPreloadFiles(): number[] {
    const unique = new Set<number>([
      ...GROUP_SMALL,
      ...GROUP_MEDIUM,
      ...GROUP_BIG,
    ]);
    return Array.from(unique);
  }

  async preload(): Promise<void> {
    try {
      // Load saved preferences
      const [saved, dexSaved] = await Promise.all([
        AsyncStorage.getItem(SOUND_ENABLED_KEY),
        AsyncStorage.getItem(DEX_VOCAL_KEY),
      ]);
      if (saved !== null) this.enabled = saved === "true";
      if (dexSaved !== null) this.dexVocalEnabled = dexSaved === "true";

      // Configure audio session (native only — web ignores this)
      if (Platform.OS !== "web") {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: false,
          staysActiveInBackground: false,
        });
      }

      // Pre-load all sounds in parallel (deduped by file).
      const files = this.getPreloadFiles();
      await Promise.all(
        files.map(async (file) => {
          try {
            const { sound } = await Audio.Sound.createAsync(file, {
              shouldPlay: false,
              volume: 1.0,
            });
            this.soundsByFile[file] = sound;
          } catch {
            // Silently skip individual load failures
          }
        })
      );

      this.loaded = true;
    } catch {
      // Preload failures must not crash the app
    }
  }

  async play(name: SoundEvent): Promise<void> {
    if (!this.enabled) return;

    const isPriority = name === "debt_paid_off";
    const now = Date.now();
    // Self-heal if callbacks fail and state gets stuck.
    if ((this.isPlaying || this.playRequestInFlight) && now - this.lastStartedAtMs > this.maxClipMs) {
      this.unlockPlaybackState();
    }
    // Strict single-voice mode: never start another clip while one is active/in-flight.
    if (this.isPlaying || this.playRequestInFlight) return;
    // Brief anti-double-tap window after previous start.
    if (!isPriority && now - this.lastStartedAtMs < this.minGapMs) return;

    // Reserve a single slot immediately to prevent same-tick queue races.
    this.playRequestInFlight = true;

    // Serialize playback to avoid race conditions during rapid triggers.
    this.playLock = this.playLock.then(() => this.playInternal(name)).catch(() => {});
    return this.playLock;
  }

  private async playInternal(name: SoundEvent): Promise<void> {
    const isDebtPaidOff = name === "debt_paid_off";

    try {
      // debt_paid_off overrides silent mode on iOS
      if (isDebtPaidOff && Platform.OS === "ios") {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      }

      const file = this.pickRandomFile(name);
      const sound = this.soundsByFile[file];
      if (sound) {
        await sound.setPositionAsync(0);
        this.isPlaying = true;
        this.playRequestInFlight = false;
        this.lastStartedAtMs = Date.now();
        this.clearWatchdog();
        this.playbackWatchdog = setTimeout(() => this.unlockPlaybackState(), this.maxClipMs);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded || status.didJustFinish) this.unlockPlaybackState();
        });
        await sound.playAsync();
      } else if (file) {
        // Fallback: load on-demand if preload didn't complete
        const { sound: s } = await Audio.Sound.createAsync(file, {
          shouldPlay: false,
          volume: 1.0,
        });
        this.soundsByFile[file] = s;
        this.isPlaying = true;
        this.playRequestInFlight = false;
        this.lastStartedAtMs = Date.now();
        this.clearWatchdog();
        this.playbackWatchdog = setTimeout(() => this.unlockPlaybackState(), this.maxClipMs);
        s.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded || status.didJustFinish) this.unlockPlaybackState();
        });
        await s.playAsync();
      }
    } catch (e) {
      this.unlockPlaybackState();
      if (__DEV__) console.log("SoundManager: play error for", name, e);
    } finally {
      // If we never started playback, release in-flight lock.
      if (!this.isPlaying) this.playRequestInFlight = false;
      // Restore normal audio mode after debt_paid_off
      if (isDebtPaidOff && Platform.OS === "ios") {
        Audio.setAudioModeAsync({ playsInSilentModeIOS: false }).catch(() => {});
      }
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    AsyncStorage.setItem(SOUND_ENABLED_KEY, String(enabled)).catch(() => {});
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async loadEnabled(): Promise<boolean> {
    try {
      const saved = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      if (saved !== null) this.enabled = saved === "true";
    } catch {}
    return this.enabled;
  }

  // ─── Dex vocalization (optional, design brief) ─────────────────────────────
  setDexVocalEnabled(enabled: boolean): void {
    this.dexVocalEnabled = enabled;
    AsyncStorage.setItem(DEX_VOCAL_KEY, String(enabled)).catch(() => {});
  }

  isDexVocalEnabled(): boolean {
    return this.dexVocalEnabled;
  }

  async loadDexVocalEnabled(): Promise<boolean> {
    try {
      const saved = await AsyncStorage.getItem(DEX_VOCAL_KEY);
      if (saved !== null) this.dexVocalEnabled = saved === "true";
    } catch {}
    return this.dexVocalEnabled;
  }

  /** Play short Dex sound when mascot state changes. Only if sound + Dex vocal are enabled. */
  playDexVocal(type: DexVocalType): void {
    if (!this.enabled || !this.dexVocalEnabled) return;
    const event = DEX_VOCAL_MAP[type];
    // Let reward sounds go first; Dex voice is secondary.
    setTimeout(() => {
      if (this.isPlaying || this.playRequestInFlight) return;
      void this.play(event);
    }, 260);
  }
}

export const soundManager = new SoundManager();
