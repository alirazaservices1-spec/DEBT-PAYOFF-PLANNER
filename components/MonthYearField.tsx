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
import {
  parseMonthYearString,
  formatMonthYear,
  monthYearToDate,
  dateToMonthYear,
} from "@/lib/monthYear";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  inputStyle?: object;
};

const MIN_DATE = new Date(2000, 0, 1);
const MAX_DATE = new Date(2045, 11, 31);

function safePickerDate(d: Date): Date {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    return new Date();
  }
  const t = d.getTime();
  if (t < MIN_DATE.getTime()) return MIN_DATE;
  if (t > MAX_DATE.getTime()) return MAX_DATE;
  return d;
}

export function MonthYearField({
  value,
  onChangeText,
  placeholder = "MM/YYYY",
  placeholderTextColor = "#999",
  inputStyle,
}: Props) {
  const [iosOpen, setIosOpen] = useState(false);
  const [androidOpen, setAndroidOpen] = useState(false);
  const [iosTemp, setIosTemp] = useState(() => new Date());

  const pickerDate = useMemo(() => {
    const p = parseMonthYearString(value);
    const raw = p ? monthYearToDate(p.month, p.year) : new Date();
    return safePickerDate(raw);
  }, [value]);

  useEffect(() => {
    if (iosOpen) setIosTemp(safePickerDate(pickerDate));
  }, [iosOpen, pickerDate]);

  const applyDate = useCallback(
    (d: Date) => {
      const clamped = safePickerDate(d);
      const { month, year } = dateToMonthYear(clamped);
      onChangeText(formatMonthYear(month, year));
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
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.webHint}>Format: MM/YYYY - calendar icon on iOS/Android</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          style={[inputStyle as any, { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={(t) => {
            const cleaned = t.replace(/[^\d/\- ]/g, "");
            onChangeText(cleaned);
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={openPicker}
          hitSlop={10}
          style={({ pressed }) => [styles.calBtn, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityLabel="Choose month and year"
        >
          <Ionicons name="calendar-outline" size={22} color="#1A6FC4" />
        </Pressable>
      </View>

      {Platform.OS === "android" && androidOpen && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          onChange={onNativeChange}
          minimumDate={MIN_DATE}
          maximumDate={MAX_DATE}
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
                <Text style={styles.sheetTitle}>Intro ends</Text>
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
                value={safePickerDate(iosTemp)}
                mode="date"
                display="spinner"
                themeVariant="light"
                onChange={(_, d) => {
                  if (d) setIosTemp(safePickerDate(d));
                }}
                minimumDate={MIN_DATE}
                maximumDate={MAX_DATE}
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
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#000000" },
  sheetLink: { fontSize: 17, color: "#1A6FC4" },
  sheetDone: { fontWeight: "700" },
});
