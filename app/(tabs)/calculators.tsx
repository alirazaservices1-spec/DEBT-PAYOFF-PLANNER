import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useCurrency } from "@/context/CurrencyContext";

function parseNum(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

function monthsToStr(m: number): string {
  if (m <= 0) return "—";
  const yrs = Math.floor(m / 12);
  const mos = Math.round(m % 12);
  if (yrs === 0) return `${mos} mo`;
  if (mos === 0) return `${yrs} yr`;
  return `${yrs} yr ${mos} mo`;
}

function CalcInput({
  label,
  value,
  onChange,
  suffix,
  prefix,
  placeholder,
  C,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  prefix?: string;
  placeholder?: string;
  C: typeof Colors.light;
}) {
  return (
    <View style={inputStyles.wrap}>
      <Text style={[inputStyles.label, { color: C.textSecondary }]}>{label}</Text>
      <View style={[inputStyles.row, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
        {prefix ? <Text style={[inputStyles.affix, { color: C.textSecondary }]}>{prefix}</Text> : null}
        <TextInput
          style={[inputStyles.input, { color: C.text }]}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder={placeholder ?? "0"}
          placeholderTextColor={C.textSecondary + "80"}
        />
        {suffix ? <Text style={[inputStyles.affix, { color: C.textSecondary }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: { gap: 4 },
  label: { fontSize: 13, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  input: { flex: 1, fontSize: 16, fontWeight: "500" },
  affix: { fontSize: 15, fontWeight: "600", marginHorizontal: 4 },
});

function ResultRow({ label, value, highlight, C }: { label: string; value: string; highlight?: boolean; C: typeof Colors.light }) {
  return (
    <View style={[rStyles.row, { borderBottomColor: C.border }]}>
      <Text style={[rStyles.label, { color: C.textSecondary }]}>{label}</Text>
      <Text style={[rStyles.value, { color: highlight ? Colors.primary : C.text }]}>{value}</Text>
    </View>
  );
}

const rStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 14 },
  value: { fontSize: 15, fontWeight: "700" },
});

function SectionCard({ title, icon, color, children, C }: {
  title: string; icon: string; color: string; children: React.ReactNode; C: typeof Colors.light;
}) {
  return (
    <View style={[sStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={sStyles.header}>
        <View style={[sStyles.iconWrap, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={[sStyles.title, { color: C.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const sStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700" },
});

function PayoffCalculator({ C, fmt }: { C: typeof Colors.light; fmt: (n: number) => string }) {
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [extraPayment, setExtraPayment] = useState("");

  const result = useMemo(() => {
    const bal = parseNum(balance);
    const apr = parseNum(rate) / 100 / 12;
    const min = parseNum(minPayment);
    const extra = parseNum(extraPayment);

    if (bal <= 0 || min <= 0) return null;

    const calcMonths = (payment: number) => {
      if (payment <= 0) return Infinity;
      if (apr === 0) return Math.ceil(bal / payment);
      let b = bal;
      let months = 0;
      let totalInterest = 0;
      while (b > 0.01 && months < 600) {
        const interest = b * apr;
        totalInterest += interest;
        b = b + interest - payment;
        months++;
        if (b <= 0) break;
      }
      return { months, totalInterest };
    };

    const withoutExtra = calcMonths(min);
    const withExtra = calcMonths(min + extra);

    if (typeof withoutExtra === "number" || typeof withExtra === "number") return null;

    return {
      monthsWithout: withoutExtra.months,
      monthsWith: withExtra.months,
      interestWithout: withoutExtra.totalInterest,
      interestWith: withExtra.totalInterest,
      interestSaved: withoutExtra.totalInterest - withExtra.totalInterest,
      monthsSaved: withoutExtra.months - withExtra.months,
    };
  }, [balance, rate, minPayment, extraPayment]);

  return (
    <SectionCard title="Payoff Date + Extra Payments" icon="calendar" color={Colors.primary} C={C}>
      <View style={{ gap: 12 }}>
        <CalcInput label="Current Balance" value={balance} onChange={setBalance} prefix="$" placeholder="10,000" C={C} />
        <CalcInput label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" placeholder="18.99" C={C} />
        <CalcInput label="Minimum Monthly Payment" value={minPayment} onChange={setMinPayment} prefix="$" placeholder="250" C={C} />
        <CalcInput label="Extra Monthly Payment" value={extraPayment} onChange={setExtraPayment} prefix="$" placeholder="100" C={C} />
      </View>

      {result && (
        <View style={[calcStyles.results, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
          <Text style={[calcStyles.resultsTitle, { color: C.textSecondary }]}>Without Extra Payments</Text>
          <ResultRow label="Payoff Time" value={monthsToStr(result.monthsWithout)} C={C} />
          <ResultRow label="Total Interest Paid to Date" value={fmt(result.interestWithout)} C={C} />

          {parseNum(extraPayment) > 0 && (
            <>
              <Text style={[calcStyles.resultsTitle, { color: Colors.primary, marginTop: 8 }]}>With +{fmt(parseNum(extraPayment))}/mo Extra</Text>
              <ResultRow label="Payoff Time" value={monthsToStr(result.monthsWith)} highlight C={C} />
              <ResultRow label="Total Interest Paid to Date" value={fmt(result.interestWith)} C={C} />
              <ResultRow label="Interest Saved" value={fmt(result.interestSaved)} highlight C={C} />
              <ResultRow label="Time Saved" value={monthsToStr(result.monthsSaved)} highlight C={C} />
            </>
          )}
        </View>
      )}
    </SectionCard>
  );
}

function MonthlyPaymentCalculator({ C, fmt }: { C: typeof Colors.light; fmt: (n: number) => string }) {
  const [loanAmount, setLoanAmount] = useState("");
  const [rate, setRate] = useState("");
  const [termMonths, setTermMonths] = useState("");

  const result = useMemo(() => {
    const P = parseNum(loanAmount);
    const r = parseNum(rate) / 100 / 12;
    const n = parseNum(termMonths);
    if (P <= 0 || n <= 0) return null;
    let monthly: number;
    if (r === 0) {
      monthly = P / n;
    } else {
      monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - P;
    return { monthly, totalPayment, totalInterest };
  }, [loanAmount, rate, termMonths]);

  return (
    <SectionCard title="Monthly Payment Calculator" icon="cash" color="#9B59B6" C={C}>
      <View style={{ gap: 12 }}>
        <CalcInput label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" placeholder="25,000" C={C} />
        <CalcInput label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" placeholder="7.5" C={C} />
        <CalcInput label="Loan Term (months)" value={termMonths} onChange={setTermMonths} suffix="mo" placeholder="60" C={C} />
      </View>

      {result && (
        <View style={[calcStyles.results, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
          <ResultRow label="Monthly Payment" value={fmt(result.monthly)} highlight C={C} />
          <ResultRow label="Total Payment" value={fmt(result.totalPayment)} C={C} />
          <ResultRow label="Total Interest Paid to Date" value={fmt(result.totalInterest)} C={C} />
        </View>
      )}
    </SectionCard>
  );
}

function RefinanceCalculator({ C, fmt }: { C: typeof Colors.light; fmt: (n: number) => string }) {
  const [balance, setBalance] = useState("");
  const [currentRate, setCurrentRate] = useState("");
  const [currentTerm, setCurrentTerm] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [closingCosts, setClosingCosts] = useState("");

  const result = useMemo(() => {
    const bal = parseNum(balance);
    const curR = parseNum(currentRate) / 100 / 12;
    const curN = parseNum(currentTerm);
    const nR = parseNum(newRate) / 100 / 12;
    const nN = parseNum(newTerm);
    const costs = parseNum(closingCosts);

    if (bal <= 0 || curN <= 0 || nN <= 0) return null;

    const calcPayment = (P: number, r: number, n: number) => {
      if (r === 0) return P / n;
      return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    };

    const currentMonthly = calcPayment(bal, curR, curN);
    const newMonthly = calcPayment(bal + costs, nR, nN);
    const monthlySavings = currentMonthly - newMonthly;

    const currentTotal = currentMonthly * curN;
    const newTotal = newMonthly * nN;
    const lifetimeSavings = currentTotal - newTotal - costs;

    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(costs / monthlySavings) : null;

    return { currentMonthly, newMonthly, monthlySavings, lifetimeSavings, breakEvenMonths };
  }, [balance, currentRate, currentTerm, newRate, newTerm, closingCosts]);

  return (
    <SectionCard title="Refinance Calculator" icon="repeat" color="#E67E22" C={C}>
      <View style={{ gap: 12 }}>
        <Text style={[calcStyles.subLabel, { color: C.textSecondary }]}>Current Loan</Text>
        <CalcInput label="Current Balance" value={balance} onChange={setBalance} prefix="$" placeholder="50,000" C={C} />
        <CalcInput label="Current Rate" value={currentRate} onChange={setCurrentRate} suffix="%" placeholder="8.5" C={C} />
        <CalcInput label="Remaining Term" value={currentTerm} onChange={setCurrentTerm} suffix="mo" placeholder="48" C={C} />
        <Text style={[calcStyles.subLabel, { color: C.textSecondary }]}>New Loan</Text>
        <CalcInput label="New Rate" value={newRate} onChange={setNewRate} suffix="%" placeholder="5.5" C={C} />
        <CalcInput label="New Term" value={newTerm} onChange={setNewTerm} suffix="mo" placeholder="60" C={C} />
        <CalcInput label="Closing Costs" value={closingCosts} onChange={setClosingCosts} prefix="$" placeholder="1,500" C={C} />
      </View>

      {result && (
        <View style={[calcStyles.results, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
          <ResultRow label="Current Payment" value={fmt(result.currentMonthly)} C={C} />
          <ResultRow label="New Payment" value={fmt(result.newMonthly)} highlight C={C} />
          <ResultRow
            label="Monthly Savings"
            value={result.monthlySavings > 0 ? fmt(result.monthlySavings) : `−${fmt(-result.monthlySavings)}`}
            highlight={result.monthlySavings > 0}
            C={C}
          />
          {result.breakEvenMonths !== null && (
            <ResultRow label="Break-Even Point" value={monthsToStr(result.breakEvenMonths)} C={C} />
          )}
          <ResultRow
            label="Lifetime Savings"
            value={result.lifetimeSavings > 0 ? fmt(result.lifetimeSavings) : `−${fmt(-result.lifetimeSavings)}`}
            highlight={result.lifetimeSavings > 0}
            C={C}
          />
        </View>
      )}
    </SectionCard>
  );
}

const calcStyles = StyleSheet.create({
  results: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 2,
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default function CalculatorsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { fmt } = useCurrency();

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 50 : insets.bottom + 55;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? webTopPad : insets.top + 8,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: C.text }]}>Calculators</Text>
        <Text style={[styles.headerSub, { color: C.textSecondary }]}>
          Real-time debt & loan tools
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <PayoffCalculator C={C} fmt={fmt} />
        <MonthlyPaymentCalculator C={C} fmt={fmt} />
        <RefinanceCalculator C={C} fmt={fmt} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  headerSub: { fontSize: 16, marginTop: 2 },
  scroll: { padding: 16, gap: 16 },
});
