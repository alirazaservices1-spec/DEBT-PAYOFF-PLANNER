import React, { useCallback, useState } from "react";
import { useGame } from "@/context/GameContext";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { DebtClearedOverlay } from "@/components/DebtClearedOverlay";
import { StreakMilestoneCelebration } from "@/components/StreakMilestoneCelebration";
import { MiniCelebrationToast } from "@/components/MiniCelebrationToast";
import { SatisfactionFeedbackModal } from "@/components/SatisfactionFeedbackModal";
import { hasTriggerFired, FeedbackTrigger } from "@/lib/satisfactionFeedbackGate";

export function CelebrationHost() {
  const { celebration, dismissCelebration, lastXpGain, miniCelebration, dismissMiniCelebration } = useGame();

  const [feedbackTrigger, setFeedbackTrigger] = useState<FeedbackTrigger | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const maybeShowFeedback = useCallback(async (trigger: FeedbackTrigger) => {
    const alreadyFired = await hasTriggerFired(trigger);
    if (!alreadyFired) {
      setFeedbackTrigger(trigger);
      setFeedbackVisible(true);
    }
  }, []);

  const handleDismissDebtCleared = useCallback(() => {
    dismissCelebration();
    setTimeout(() => maybeShowFeedback("debt_paid_off"), 600);
  }, [dismissCelebration, maybeShowFeedback]);

  const handleDismissStreakMilestone = useCallback(() => {
    const days = celebration.streakDays ?? 0;
    dismissCelebration();
    if (days >= 7) {
      setTimeout(() => maybeShowFeedback("streak_7"), 600);
    }
  }, [dismissCelebration, maybeShowFeedback, celebration.streakDays]);

  const handleDismissLevelUp = useCallback(() => {
    const level = celebration.level ?? 0;
    dismissCelebration();
    if (level >= 5) {
      setTimeout(() => maybeShowFeedback("level_up_5plus"), 600);
    }
  }, [dismissCelebration, maybeShowFeedback, celebration.level]);

  return (
    <>
      <LevelUpOverlay
        visible={celebration.type === "level_up"}
        level={celebration.level ?? 2}
        recentXpGained={celebration.type === "level_up" ? lastXpGain.amount : undefined}
        onDismiss={handleDismissLevelUp}
      />
      <DebtClearedOverlay
        visible={celebration.type === "debt_cleared"}
        debtName={celebration.debtName}
        onDismiss={handleDismissDebtCleared}
      />
      <StreakMilestoneCelebration
        visible={celebration.type === "streak_milestone" && (celebration.streakDays ?? 0) > 1}
        streakDays={celebration.streakDays ?? 3}
        bonusXp={celebration.bonusXp ?? 75}
        onDismiss={handleDismissStreakMilestone}
      />
      {feedbackTrigger !== null && (
        <SatisfactionFeedbackModal
          visible={feedbackVisible}
          trigger={feedbackTrigger}
          onClosed={() => {
            setFeedbackVisible(false);
            setFeedbackTrigger(null);
          }}
        />
      )}
      <MiniCelebrationToast
        celebration={miniCelebration}
        onDismiss={dismissMiniCelebration}
      />
    </>
  );
}
