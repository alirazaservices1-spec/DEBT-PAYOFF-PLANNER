import React from "react";
import { useGame } from "@/context/GameContext";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { DebtClearedOverlay } from "@/components/DebtClearedOverlay";
import { StreakMilestoneCelebration } from "@/components/StreakMilestoneCelebration";
import { FirstPaymentCelebration } from "@/components/FirstPaymentCelebration";
export function CelebrationHost() {
  const { celebration, dismissCelebration, lastXpGain } = useGame();

  return (
    <>
      <LevelUpOverlay
        visible={celebration.type === "level_up"}
        level={celebration.level ?? 2}
        recentXpGained={celebration.type === "level_up" ? lastXpGain.amount : undefined}
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
    </>
  );
}
