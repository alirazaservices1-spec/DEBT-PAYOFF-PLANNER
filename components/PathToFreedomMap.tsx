import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, Easing, Pressable } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { DexMascot } from "./DexMascot";
import { useGame } from "@/context/GameContext";
import { Ionicons } from "@expo/vector-icons";

const SW = Dimensions.get("window").width;

interface Props {
  streak: number;
  isDark: boolean;
}

export function PathToFreedomMap({ streak, isDark }: Props) {
  const { buyStreakShield, hasStreakShield, totalXp } = useGame();
  
  const C = isDark 
    ? { surface: "#161719", border: "#2E3338", text: "#F0F1F3", path: "#3A4048", fill: Colors.green }
    : { surface: "#FFFFFF", border: "#DDE2E8", text: "#111318", path: "#E8E8E8", fill: Colors.green };

  // Calculate position along the path (0 to 1) based on a 7-day cycle
  const currentLevelProgress = (streak % 7) / 7;
  
  // Animation for the character moving
  const posAnim = useRef(new Animated.Value(currentLevelProgress)).current;
  
  useEffect(() => {
    Animated.timing(posAnim, {
      toValue: currentLevelProgress,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentLevelProgress]);

  // Winding path SVG details
  const pathData = "M 40 120 Q 80 120 120 80 T 200 60 T 280 100";
  
  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Text style={[s.title, { color: C.text }]}>Path to Freedom</Text>
      
      <View style={s.mapContainer}>
        <Svg width={320} height={160}>
          {/* Background path */}
          <Path d={pathData} stroke={C.path} strokeWidth={10} fill="none" strokeLinecap="round" />
          
          {/* Active progress path */}
          <Path 
            d={pathData} 
            stroke={C.fill} 
            strokeWidth={10} 
            fill="none" 
            strokeLinecap="round" 
            strokeDasharray="400"
            strokeDashoffset={400 * (1 - currentLevelProgress)} 
          />

          {/* Start node */}
          <Circle cx={40} cy={120} r={8} fill={C.surface} stroke={C.border} strokeWidth={3} />
          
          {/* End chest node */}
          <Circle cx={280} cy={100} r={12} fill={Colors.gold} stroke="#FFF" strokeWidth={2} />
        </Svg>

        {/* Character Avatar */}
        <Animated.View style={[s.avatar, {
           transform: [{
             translateX: posAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 280] })
           }, {
             translateY: posAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [90, 30, 70] })
           }]
        }]}>
          <DexMascot state="happy" size={40} />
        </Animated.View>
      </View>

      {/* Target description & Shield */}
      <View style={s.footer}>
        <Text style={[s.desc, { color: C.text, flex: 1 }]}>
           {7 - (streak % 7)} days until next chest!
        </Text>
        
        <Pressable 
          onPress={buyStreakShield}
          disabled={hasStreakShield || totalXp < 500}
          style={[
            s.shieldBtn, 
            hasStreakShield ? s.shieldBtnActive : 
            totalXp < 500 ? s.shieldBtnDisabled : s.shieldBtnAvailable
          ]}
        >
          <Ionicons name="shield-checkmark" size={16} color={hasStreakShield ? "#FFF" : "#72A0D4"} />
          <Text style={[s.shieldText, hasStreakShield && { color: "#FFF" }]}>
            {hasStreakShield ? "Shield Active" : "Freeze Streak (500 XP)"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    alignSelf: "flex-start",
  },
  mapContainer: {
    width: 320,
    height: 160,
    marginTop: 12,
    position: "relative",
  },
  avatar: {
    position: "absolute",
    left: -20, // Center on path
    top: 0,
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  desc: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  shieldBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  shieldBtnAvailable: {
    borderColor: "#72A0D4",
    backgroundColor: "rgba(114,160,212,0.1)",
  },
  shieldBtnDisabled: {
    borderColor: "#4A5568",
    opacity: 0.5,
  },
  shieldBtnActive: {
    backgroundColor: "#2E7C31",
    borderColor: "#2E7C31",
  },
  shieldText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "#72A0D4",
  }
});
