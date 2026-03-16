import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGame } from "@/context/GameContext";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { XPEventType } from "@/context/GameContext";

export function DailyActionList({ isDark }: { isDark: boolean }) {
  const { awardXp, logDailyAction } = useGame();
  
  // States of actions
  const [savedMoney, setSavedMoney] = useState(false);
  const [noSpend, setNoSpend] = useState(false);
  const [shared, setShared] = useState(false);
  
  const C = isDark 
    ? { bg: "#0D1520", border: "#2A3D55", text: "#FFFFFF", textSec: "rgba(255,255,255,0.6)" }
    : { bg: "#FFFFFF", border: "#E8E8E8", text: "#05130A", textSec: "#8FA89A" };

  const handleAction = (type: XPEventType, xp: number, setter: (val: boolean) => void) => {
    setter(true);
    awardXp(type);
    logDailyAction(type);
  };

  const BONUS_ACTIONS = [
    { id: "loan", text: "Check if you could save time and money with a lower interest rate loan" },
    { id: "relief", text: "Check if you could save money and time with a debt relief program" },
    { id: "tax", text: "For tax or business debt show those options too" },
    { id: "bankruptcy", text: "Some people find it beneficial to see if they may qualify for Chapter 7 or 13 bankruptcy." }
  ];

  const [bonusIndex, setBonusIndex] = useState(0);
  const [bonusDoneState, setBonusDoneState] = useState<Record<string, boolean>>({});

  const handleBonus = (checked: boolean) => {
    const cur = BONUS_ACTIONS[bonusIndex];
    setBonusDoneState(prev => ({ ...prev, [cur.id]: true }));
    awardXp("BONUS_CHECK"); // Assume this gives 10 XP
    if (checked) {
      Alert.alert("Awesome!", "Please send us feedback on this so we can improve our recommendations.");
    }
    if (bonusIndex < BONUS_ACTIONS.length - 1) {
      setBonusIndex(bonusIndex + 1);
    }
  };

  const currentBonus = BONUS_ACTIONS[bonusIndex];
  const isBonusDone = bonusDoneState[currentBonus.id];

  return (
    <View style={[s.container, { backgroundColor: C.bg, borderColor: C.border }]}>
      <View style={s.header}>
        <Text style={[s.title, { color: C.text }]}>Action items today:</Text>
        <Text style={[s.subtitle, { color: C.textSec }]}>Complete tasks to earn XP and build your streak!</Text>
      </View>

      <ActionItem 
        icon="wallet" color={Colors.green} 
        title="Saved $0.50 today" xp={20}
        done={savedMoney}
        onPress={() => handleAction("DAILY_SAVING", 20, setSavedMoney)}
        C={C}
      />
      
      <ActionItem 
        icon="card" color={Colors.orange} 
        title="Didn't spend on credit cards" xp={15}
        done={noSpend}
        onPress={() => handleAction("NO_SPEND", 15, setNoSpend)}
        C={C}
      />
      
      <ActionItem 
        icon="share-social" color={Colors.blue} 
        title="Post your success and commitment to Facebook" xp={10}
        done={shared}
        onPress={() => handleAction("SOCIAL_SHARE", 10, setShared)}
        C={C}
      />

      {!isBonusDone && (
        <View style={[s.bonusCard, { borderColor: C.border }]}>
          <Text style={[s.bonusText, { color: C.text }]}>{currentBonus.text}</Text>
          <View style={s.bonusBtns}>
            <Pressable style={s.bonusBtn} onPress={() => handleBonus(true)}>
              <Text style={s.bonusBtnText}>done I checked</Text>
            </Pressable>
            <Pressable style={s.bonusBtnSkip} onPress={() => handleBonus(false)}>
              <Text style={s.bonusBtnSkipText}>I choose to skip</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function ActionItem({ icon, color, title, xp, done, onPress, C }: any) {
  return (
    <Pressable 
      onPress={onPress} 
      disabled={done}
      style={[s.itemRow, { borderColor: C.border, opacity: done ? 0.6 : 1 }]}
    >
      <View style={[s.iconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={[s.itemTitle, { color: C.text, textDecorationLine: done ? 'line-through' : 'none' }]}>
          {title}
        </Text>
        <Text style={[s.itemXp, { color: color }]}>+{xp} XP</Text>
      </View>

      <View style={[s.checkbox, done && { backgroundColor: Colors.green, borderColor: Colors.green }]}>
        {done && <Ionicons name="checkmark" size={16} color="#FFF" />}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    marginBottom: 2,
  },
  itemXp: {
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  bonusCard: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  bonusText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    lineHeight: 20,
    marginBottom: 12,
  },
  bonusBtns: {
    flexDirection: "row",
    gap: 8,
  },
  bonusBtn: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bonusBtnText: {
    color: "#FFF",
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  bonusBtnSkip: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4A5568",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bonusBtnSkipText: {
    color: "#4A5568",
    fontFamily: Fonts.bold,
    fontSize: 12,
  }
});
