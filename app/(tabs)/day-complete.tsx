import React from "react";
import DayCompleteScreen from "../day-complete";

// Wrapper so `/day-complete` appears *inside* the tab layout.
// This preserves the bottom navigation bar.
export default function TabsDayComplete() {
  return <DayCompleteScreen />;
}

