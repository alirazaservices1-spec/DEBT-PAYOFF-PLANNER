import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  Platform,
  Keyboard,
  StyleSheet,
} from "react-native";
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

export function DueDayPickerField({
  value,
  onChangeText,
  placeholder = "1",
  placeholderTextColor = "#999",
  inputStyle,
  calendarIconColor = "#1A6FC4",
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const openPicker = () => {
    if (Platform.OS === "web") return;
    // Dismiss keypad first so the day sheet can receive taps.
    Keyboard.dismiss();
    setTimeout(() => setPickerOpen(true), 80);
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
          selectTextOnFocus
          maxLength={2}
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

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
        statusBarTranslucent={Platform.OS === "android"}
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdropTap} onPress={() => setPickerOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Payment due day</Text>
              <Text style={styles.sheetHint}>Please select the day the payment is due.</Text>
            </View>
            <View style={styles.dayGrid}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const selected = clampDayOfMonth(parseInt(value || "1", 10)) === day;
                return (
                  <Pressable
                    key={day}
                    onPress={() => {
                      onChangeText(String(day));
                      setPickerOpen(false);
                    }}
                    style={[styles.dayChip, selected && styles.dayChipSelected]}
                    accessibilityRole="button"
                    accessibilityLabel={`Set due day ${day}`}
                  >
                    <Text style={[styles.dayChipText, selected && styles.dayChipTextSelected]}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  backdropTap: { flex: 1 },
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#E0D8CE",
  },
  sheetHeader: {
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#000000", marginBottom: 4 },
  sheetHint: { fontSize: 12, color: "#6B7280" },
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayChip: {
    width: 44,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  dayChipSelected: {
    backgroundColor: "rgba(26,111,196,0.12)",
    borderColor: "#1A6FC4",
  },
  dayChipText: { fontSize: 15, fontWeight: "700", color: "#111827" },
  dayChipTextSelected: { color: "#1A6FC4" },
});
