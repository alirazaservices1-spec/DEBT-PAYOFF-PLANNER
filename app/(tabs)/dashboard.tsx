import React, { useEffect } from "react";
import MainMenuScreen from "@/app/main-menu";
import { useLocalSearchParams, router } from "expo-router";
import { useDebts } from "@/context/DebtContext";

export default function DashboardScreen() {
  const { openLog } = useLocalSearchParams<{ openLog?: string }>();
  const { debts } = useDebts();

  useEffect(() => {
    if (openLog !== "1") return;

    // Notification tap should open the "Mark Paid / Log payment" flow.
    // Pick the first debt with a non-zero balance; otherwise pick the first debt.
    const target = debts.find((d) => (d.balance ?? 0) > 0) ?? debts[0];
    if (!target) {
      // No debts yet; send them to the Debts tab so they can add one.
      router.replace("/(tabs)/debts");
      return;
    }

    router.replace(`/debt/${target.id}?tab=transactions&openMarkPaid=1`);
  }, [openLog, debts]);

  // While we redirect, render nothing to avoid flicker.
  if (openLog === "1") return null;

  return <MainMenuScreen showClose={false} />;
}

