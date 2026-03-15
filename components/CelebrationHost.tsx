import React from "react";
import { useGame } from "@/context/GameContext";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { DebtClearedOverlay } from "@/components/DebtClearedOverlay";
import { StreakMilestoneCelebration } from "@/components/StreakMilestoneCelebration";
import { FirstPaymentCelebration } from "@/components/FirstPaymentCelebration";
import { OnboardingCelebration } from "@/components/OnboardingCelebration";

export function CelebrationHost() {
  const { celebration, dismissCelebration } = useGame();

  return (
    <>
      <LevelUpOverlay
        visible={celebration.type === "level_up"}
        level={celebration.level ?? 2}
        onDismiss={dismissCelebration}
      />
      <DebtClearedOverlay
        visible={celebration.type === "debt_cleared"}
        debtName={celebration.debtName}
        onDismiss={dismissCelebration}
      />
      <StreakMilestoneCelebration
        visible={celebration.type === "streak_milestone"}
        streakDays={celebration.streakDays ?? 3}
        bonusXp={celebration.bonusXp ?? 75}
        onDismiss={dismissCelebration}
      />
      <FirstPaymentCelebration
        visible={celebration.type === "first_payment"}
        onDismiss={dismissCelebration}
      />
      <OnboardingCelebration
        visible={celebration.type === "first_debt"}
        onDismiss={dismissCelebration}
      />
    </>
  );
}
