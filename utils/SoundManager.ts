// ─── SoundManager — expo-av based audio for React Native + Web ────────────────
// Preloads all WAV files at app start for zero-delay playback.
// Persists enabled/disabled preference to AsyncStorage.
// Special: debt_paid_off bypasses iOS silent mode.

import { Audio } from "expo-av";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOUND_ENABLED_KEY = "@debtpath_sound_enabled";
const DEX_VOCAL_KEY = "@debtpath_dex_vocal_enabled";

const SOUND_FILES = {
  payment_logged:    require("../assets/sounds/Sucess.wav"),
  xp_earned:         require("../assets/sounds/xp_earned.wav"),
  streak_maintained: require("../assets/sounds/streak_maintained.wav"),
  level_up:          require("../assets/sounds/level_up.wav"),
  milestone:         require("../assets/sounds/milestone.wav"),
  streak_at_risk:    require("../assets/sounds/streak_at_risk.wav"),
  variable_bonus:    require("../assets/sounds/variable_bonus.wav"),
  interest_saved:    require("../assets/sounds/interest_saved.wav"),
  debt_paid_off:     require("../assets/sounds/debt_paid_off.wav"),
  dex_approval:      require("../assets/sounds/dex_approval.wav"),
  dex_concern:       require("../assets/sounds/dex_concern.wav"),
  dex_surprise:      require("../assets/sounds/dex_surprise.wav"),
} as const;

export type SoundEvent = keyof typeof SOUND_FILES;

export type DexVocalType = "approval" | "concern" | "surprise";
const DEX_VOCAL_MAP: Record<DexVocalType, SoundEvent> = {
  approval: "dex_approval",
  concern: "dex_concern",
  surprise: "dex_surprise",
};

class SoundManager {
  private sounds: Partial<Record<SoundEvent, Audio.Sound>> = {};
  private enabled: boolean = true;
  private dexVocalEnabled: boolean = true;
  private loaded: boolean = false;

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

      // Pre-load all sounds in parallel
      const entries = Object.entries(SOUND_FILES) as [SoundEvent, number][];
      await Promise.all(
        entries.map(async ([key, file]) => {
          try {
            const { sound } = await Audio.Sound.createAsync(file, {
              shouldPlay: false,
              volume: 1.0,
            });
            this.sounds[key] = sound;
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

    const isDebtPaidOff = name === "debt_paid_off";

    try {
      // debt_paid_off overrides silent mode on iOS
      if (isDebtPaidOff && Platform.OS === "ios") {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      }

      const sound = this.sounds[name];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } else {
        // Fallback: load on-demand if preload didn't complete
        const file = SOUND_FILES[name];
        if (file) {
          const { sound: s } = await Audio.Sound.createAsync(file, {
            shouldPlay: true,
            volume: 1.0,
          });
          this.sounds[name] = s;
        }
      }
    } catch (e) {
      if (__DEV__) console.log("SoundManager: play error for", name, e);
    } finally {
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
    this.play(event);
  }
}

export const soundManager = new SoundManager();
