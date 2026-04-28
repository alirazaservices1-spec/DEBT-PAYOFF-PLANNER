import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  useAnimatedProps,
  SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import DebtsScreen from "./debts";

/** Default tab when opening `/(tabs)` — Home first (leftmost in tab bar). */
export const unstable_settings = {
  initialRouteName: "dashboard",
};

// Evaluated once at module load — never re-checked on re-renders, preventing layout flicker
const IS_GLASS = isLiquidGlassAvailable();

const TAB_CONFIG = [
  {
    name: "dashboard",
    label: "Home",
    icon: "home-outline" as const,
    iconActive: "home" as const,
    sfDefault: "house",
    sfSelected: "house.fill",
  },
  {
    name: "debts",
    label: "Debts",
    icon: "card-outline" as const,
    iconActive: "card" as const,
    sfDefault: "creditcard",
    sfSelected: "creditcard.fill",
  },
  {
    name: "strategy",
    label: "Methods",
    icon: "bar-chart-outline" as const,
    iconActive: "bar-chart" as const,
    sfDefault: "chart.bar",
    sfSelected: "chart.bar.fill",
  },
  {
    name: "plan",
    label: "Plan",
    icon: "calendar-outline" as const,
    iconActive: "calendar" as const,
    sfDefault: "calendar",
    sfSelected: "calendar.fill",
  },
  {
    name: "more",
    label: "Settings",
    icon: "settings-outline" as const,
    iconActive: "settings" as const,
    sfDefault: "gearshape",
    sfSelected: "gearshape.fill",
  },
];

function NativeTabLayout({ onOpenDebts }: { onOpenDebts: () => void }) {
  return (
    <NativeTabs
      {...({
        iconColor: {
          default: TAB_INACTIVE,
          selected: TAB_ACTIVE,
        },
        labelStyle: {
          default: { color: TAB_INACTIVE },
          selected: { color: TAB_ACTIVE },
        },
        screenListeners: {
          tabPress: (e: { preventDefault?: () => void; target?: string }) => {
            const routeName = e.target?.split?.("-")[0] ?? "";
            if (routeName === "debts") {
              e.preventDefault?.();
              onOpenDebts();
            }
          },
        },
      } as React.ComponentProps<typeof NativeTabs>)}
    >
      {TAB_CONFIG.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Icon sf={{ default: tab.sfDefault as any, selected: tab.sfSelected as any }} />
          <Label>{tab.label}</Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

// Dark navy tab bar — matches the home screen background (#1B1850)
const TAB_BAR_BORDER     = "rgba(255,255,255,0.10)";
const TAB_PILL_BG        = "rgba(255,255,255,0.08)";
const TAB_INACTIVE       = "rgba(255,255,255,0.45)";
const TAB_ACTIVE         = "#1A6FC4";

function CustomTabBar({
  state,
  navigation,
  onOpenDebts,
}: BottomTabBarProps & { onOpenDebts: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

  const tabBarWidth = width;
  const tabWidth = tabBarWidth / TAB_CONFIG.length;

  // Routes that belong under the "More" tab — they keep the More button highlighted
  const MORE_ROUTES = ["more", "goal", "calculators"];
  const currentRouteName = state.routes[state.index]?.name ?? "";
  const moreTabIndex = TAB_CONFIG.findIndex((t) => t.name === "more");

  // The app has some screens (like day-complete) that live under the tabs group
  // but aren't real tab entries. We map them to a tab for highlighting/pill position.
  const tabHighlightRouteName = currentRouteName === "day-complete"
    ? "dashboard"
    : currentRouteName;

  // Effective index for pill animation: map sub-routes to the More tab position
  const effectiveIndex = MORE_ROUTES.includes(currentRouteName)
    ? moreTabIndex
    : Math.max(0, TAB_CONFIG.findIndex((t) => t.name === tabHighlightRouteName));

  const activeIndex = useSharedValue(effectiveIndex);

  useEffect(() => {
    activeIndex.value = withSpring(effectiveIndex, {
      damping: 20,
      stiffness: 200,
      mass: 0.6,
    });
  }, [effectiveIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeIndex.value * tabWidth }],
  }));

  const safeBottom = insets.bottom;

  return (
    <View
      style={[
        styles.tabBarOuter,
        {
          bottom: 0,
          left: 0,
          right: 0,
          borderTopColor: TAB_BAR_BORDER,
          paddingBottom: safeBottom,
        },
      ]}
    >
      <View style={styles.tabBarBlur}>
        <Animated.View
          style={[
            styles.pill,
            pillStyle,
            { width: tabWidth },
          ]}
        >
          <View
            style={[
              styles.pillInner,
              { backgroundColor: TAB_PILL_BG },
            ]}
          />
        </Animated.View>

        <View style={styles.tabRow}>
          {TAB_CONFIG.map((tab, index) => {
            const isActive =
              tab.name === "more"
                ? MORE_ROUTES.includes(currentRouteName)
                : tab.name === tabHighlightRouteName;
            return (
              <TabItem
                key={tab.name}
                tab={tab}
                isActive={isActive}
                activeIndex={activeIndex}
                index={index}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.name === "debts") {
                    onOpenDebts();
                  } else if (!isActive) {
                    navigation.navigate(tab.name);
                  }
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabItem({
  tab,
  isActive,
  activeIndex,
  index,
  onPress,
}: {
  tab: (typeof TAB_CONFIG)[0];
  isActive: boolean;
  activeIndex: SharedValue<number>;
  index: number;
  onPress: () => void;
}) {
  const animStyle = useAnimatedStyle(() => {
    const distance = Math.abs(activeIndex.value - index);
    const scale = interpolate(distance, [0, 1], [1.08, 0.94], "clamp");
    return { transform: [{ scale }] };
  });

  // Always light mode — no isDark dependency prevents any first-render colour flash
  const iconColor = isActive ? TAB_ACTIVE : TAB_INACTIVE;
  const labelColor = isActive ? TAB_ACTIVE : TAB_INACTIVE;

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
    >
      <Animated.View style={[styles.tabItemInner, animStyle]}>
        {Platform.OS === "ios" ? (
          <SymbolView
            name={isActive ? (tab.sfSelected as any) : (tab.sfDefault as any)}
            tintColor={iconColor}
            size={22}
          />
        ) : (
          <Ionicons
            name={isActive ? tab.iconActive : tab.icon}
            size={22}
            color={iconColor}
          />
        )}
        <Text
          style={[
            styles.tabLabel,
            {
              color: labelColor,
              fontWeight: isActive ? "700" : "500",
              opacity: isActive ? 1 : 0.7,
            },
          ]}
        >
          {tab.label}
        </Text>
        {isActive && <View style={styles.activeDot} />}
      </Animated.View>
    </Pressable>
  );
}

function ClassicTabLayout({ onOpenDebts }: { onOpenDebts: () => void }) {
  const renderTabBarWithDebts = React.useCallback(
    (props: BottomTabBarProps) => <CustomTabBar {...props} onOpenDebts={onOpenDebts} />,
    [onOpenDebts]
  );

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          borderTopColor: TAB_BAR_BORDER,
          borderTopWidth: 1,
        },
      }}
      tabBar={renderTabBarWithDebts}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
      {/* Not a real tab entry; included so routes under the tabs group still have tab bar state */}
      <Tabs.Screen name="day-complete" options={{ href: null, title: "Day Complete" }} />
    </Tabs>
  );
}

export default function TabLayout() {
  const [debtsVisible, setDebtsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const openDebts = React.useCallback(() => setDebtsVisible(true), []);
  const closeDebts = React.useCallback(() => setDebtsVisible(false), []);

  return (
    <>
      {IS_GLASS ? (
        <NativeTabLayout onOpenDebts={openDebts} />
      ) : (
        <ClassicTabLayout onOpenDebts={openDebts} />
      )}

      <Modal
        visible={debtsVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeDebts}
      >
        <View style={{ flex: 1 }}>
          <DebtsScreen />
          <Pressable
            onPress={closeDebts}
            hitSlop={12}
            style={{
              position: "absolute",
              top: insets.top + 12,
              right: 16,
              zIndex: 999,
              backgroundColor: "rgba(0,0,0,0.35)",
              borderRadius: 20,
              padding: 4,
            }}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: "absolute",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  tabBarBlur: {
    flex: 1,
  },
  pill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  pillInner: {
    position: "absolute",
    top: 8,
    bottom: 8,
    left: 10,
    right: 10,
    borderRadius: 20,
  },
  tabRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    fontFamily: Fonts.bold,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TAB_ACTIVE,
    marginTop: 1,
  },
});
