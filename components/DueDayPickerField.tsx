import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  inputStyle?: object;
  /** Matches other onboarding fields */
  calendarIconColor?: string;
};

function clampDayOfMonth(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > 31) return 31;
  return Math.floor(n);
}

/** Calendar date in current month/year with given due-day (clamped to that month's length). */
function referenceDateForDay(dayStr: string): Date {
  const d = clampDayOfMonth(parseInt(dayStr.trim(), 10) || 1);
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const day = Math.min(d, last);
  return new Date(y, m, day);
}

export function DueDayPickerField({
  value,
  onChangeText,
  placeholder = "1",
  placeholderTextColor = "#999",
  inputStyle,
  calendarIconColor = "#1A6FC4",
}: Props) {
  const [iosOpen, setIosOpen] = useState(false);
  const [androidOpen, setAndroidOpen] = useState(false);
  const [iosTemp, setIosTemp] = useState(() => referenceDateForDay(value));

  const pickerDate = useMemo(() => referenceDateForDay(value), [value]);

  useEffect(() => {
    if (iosOpen) setIosTemp(pickerDate);
  }, [iosOpen, pickerDate]);

  const applyDate = useCallback(
    (d: Date) => {
      const day = d.getDate();
      onChangeText(String(clampDayOfMonth(day)));
    },
    [onChangeText]
  );

  const onNativeChange = (event: { type?: string }, selected?: Date) => {
    if (Platform.OS === "android") {
      setAndroidOpen(false);
      if (event.type === "dismissed") return;
    }
    if (selected) applyDate(selected);
  };

  const openPicker = () => {
    if (Platform.OS === "web") return;
    if (Platform.OS === "ios") setIosOpen(true);
    else setAndroidOpen(true);
  };

  if (Platform.OS === "web") {
    return (
      <View>
        <TextInput
          style={inputStyle as any}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={(t) => {
            const digits = t.replace(/[^0-9]/g, "").slice(0, 2);
            onChangeText(digits);
          }}
          keyboardType="number-pad"
        />
        <Text style={styles.webHint}>Day of month (1-31). Calendar on iOS/Android.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          style={[inputStyle as any, { flex: 1, paddingRight: 12 }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType="number-pad"
          value={value}
          onChangeText={(t) => {
            const digits = t.replace(/[^0-9]/g, "").slice(0, 2);
            onChangeText(digits);
          }}
        />
        <Pressable
          onPress={openPicker}
          hitSlop={10}
          style={({ pressed }) => [styles.calBtn, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityLabel="Open calendar to choose payment due day"
        >
          <Ionicons name="calendar-outline" size={22} color={calendarIconColor} />
        </Pressable>
      </View>

      {Platform.OS === "android" && androidOpen && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          onChange={onNativeChange}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal visible={iosOpen} transparent animationType="slide">
          <View style={styles.iosModalRoot}>
            <Pressable style={styles.iosBackdropTap} onPress={() => setIosOpen(false)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setIosOpen(false)}>
                  <Text style={styles.sheetLink}>Cancel</Text>
                </Pressable>
                <Text style={styles.sheetTitle}>Payment due date</Text>
                <Pressable
                  onPress={() => {
                    applyDate(iosTemp);
                    setIosOpen(false);
                  }}
                >
                  <Text style={[styles.sheetLink, styles.sheetDone]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={iosTemp}
                mode="date"
                display="spinner"
                themeVariant="light"
                onChange={(_, d) => {
                  if (d) setIosTemp(d);
                }}
                style={{ alignSelf: "center" }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iosModalRoot: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  iosBackdropTap: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  calBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(26,111,196,0.08)",
  },
  webHint: { fontSize: 10, color: "#888", marginTop: 4 },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0D8CE",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#1A0F08" },
  sheetLink: { fontSize: 17, color: "#1A6FC4" },
  sheetDone: { fontWeight: "700" },
});
