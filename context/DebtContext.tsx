import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Debt,
  DebtType,
  Strategy,
  StrategyResult,
  isSecuredByType,
  isBusinessDebtType,
  runStrategy,
} from "@/lib/calculations";
import { secureGetItem, secureSetItem, secureRemoveItem } from "@/lib/secure-storage";

const DEBTS_KEY = "@debtfree_debts_v2";
const PAYMENTS_KEY = "@debtfree_payments_v2";
const EXTRA_PAYMENT_KEY = "@debtfree_extra";
const SELECTED_STRATEGY_KEY = "@debtfree_strategy";
const CUSTOM_ORDER_KEY = "@debtfree_custom_order";
const LEAD_SUBMITTED_KEY = "@debtfree_lead_submitted";
const ONBOARDING_KEY = "@debtfree_onboarding_done";
/** User chose "Skip to home" on splash — show CTA to run full welcome flow */
const WELCOME_SKIPPED_KEY = "@debtpath_welcome_skipped_explore";

export interface PaymentLog {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  isMissed: boolean;
  note?: string;
}

interface DebtContextValue {
  debts: Debt[];
  payments: PaymentLog[];
  extraPayment: number;
  selectedStrategy: Strategy;
  customOrder: string[];
  onboardingDone: boolean;
  /** True if user skipped splash welcome; cleared when they finish onboarding */
  welcomeSkipped: boolean;
  leadSubmittedAt: string | null;

  avalancheResult: StrategyResult;
  snowballResult: StrategyResult;
  customResult: StrategyResult;
  activeResult: StrategyResult;

  totalBalance: number;
  totalUnsecuredBalance: number;
  totalMinimums: number;
  hasHighAprDebt: boolean;
  hasTaxDebt: boolean;
  hasBusinessDebt: boolean;
  creditCardCount: number;
  hasMissedPayment: boolean;

  addDebt: (debt: Omit<Debt, "id" | "dateAdded">) => Promise<void>;
  updateDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  setExtraPayment: (amount: number) => Promise<void>;
  setSelectedStrategy: (strategy: Strategy) => Promise<void>;
  setCustomOrder: (order: string[]) => Promise<void>;
  logPayment: (log: Omit<PaymentLog, "id">) => Promise<void>;
  setOnboardingDone: () => Promise<void>;
  setWelcomeSkipped: (value: boolean) => Promise<void>;
  setLeadSubmitted: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const DebtContext = createContext<DebtContextValue | null>(null);

export function DebtProvider({ children }: { children: React.ReactNode }) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [extraPayment, setExtraPaymentState] = useState(0);
  const [selectedStrategy, setSelectedStrategyState] = useState<Strategy>("avalanche");
  const [customOrder, setCustomOrderState] = useState<string[]>([]);
  const [onboardingDone, setOnboardingDoneState] = useState(false);
  const [welcomeSkipped, setWelcomeSkippedState] = useState(false);
  const [leadSubmittedAt, setLeadSubmittedAtState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [od, ws] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(WELCOME_SKIPPED_KEY),
        ]);
        if (od) setOnboardingDoneState(true);
        if (ws === "1") setWelcomeSkippedState(true);
        const [dRaw, pRaw] = await Promise.all([
          secureGetItem(DEBTS_KEY),
          secureGetItem(PAYMENTS_KEY),
        ]);
        let d = dRaw;
        let p = pRaw;
        if (!d) {
          const legacy = await AsyncStorage.getItem(DEBTS_KEY);
          if (legacy) {
            d = legacy;
            await secureSetItem(DEBTS_KEY, legacy);
          }
        }
        if (!p) {
          const legacy = await AsyncStorage.getItem(PAYMENTS_KEY);
          if (legacy) {
            p = legacy;
            await secureSetItem(PAYMENTS_KEY, legacy);
          }
        }
        const [e, s, co, ls] = await Promise.all([
          AsyncStorage.getItem(EXTRA_PAYMENT_KEY),
          AsyncStorage.getItem(SELECTED_STRATEGY_KEY),
          AsyncStorage.getItem(CUSTOM_ORDER_KEY),
          AsyncStorage.getItem(LEAD_SUBMITTED_KEY),
        ]);
        if (d) setDebts(JSON.parse(d));
        if (p) setPayments(JSON.parse(p));
        if (e) {
          const parsed = parseFloat(e);
          setExtraPaymentState(
            Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
          );
        }
        if (s) setSelectedStrategyState(s as Strategy);
        if (co) setCustomOrderState(JSON.parse(co));
        if (ls) setLeadSubmittedAtState(ls);
      } catch (_) {
        // Swallow storage errors — app should still render with empty state
      } finally {
        // Only mark context as loaded after debts + payments (and related prefs) are hydrated.
        setLoaded(true);
      }
    })();
  }, []);

  const safeExtra = useMemo(
    () =>
      typeof extraPayment === "number" &&
      Number.isFinite(extraPayment) &&
      extraPayment >= 0
        ? extraPayment
        : 0,
    [extraPayment]
  );

  const avalancheResult = useMemo(
    () => runStrategy(debts, safeExtra, "avalanche"),
    [debts, safeExtra]
  );
  const snowballResult = useMemo(
    () => runStrategy(debts, safeExtra, "snowball"),
    [debts, safeExtra]
  );
  const customResult = useMemo(
    () => runStrategy(debts, safeExtra, "custom", customOrder),
    [debts, safeExtra, customOrder]
  );

  const activeResult = useMemo(() => {
    if (selectedStrategy === "avalanche") return avalancheResult;
    if (selectedStrategy === "snowball") return snowballResult;
    return customResult;
  }, [selectedStrategy, avalancheResult, snowballResult, customResult]);

  const totalBalance = useMemo(
    () => debts.reduce((s, d) => s + d.balance, 0),
    [debts]
  );

  const totalUnsecuredBalance = useMemo(
    () => debts.filter((d) => !d.isSecured).reduce((s, d) => s + d.balance, 0),
    [debts]
  );

  const totalMinimums = useMemo(
    () => debts.reduce((s, d) => s + d.minimumPayment, 0),
    [debts]
  );

  const hasHighAprDebt = useMemo(
    () => debts.some((d) => d.apr > 10),
    [debts]
  );

  const hasTaxDebt = useMemo(() => {
    const taxTotal = debts
      .filter((d) => d.debtType === "taxDebt")
      .reduce((s, d) => s + d.balance, 0);
    return taxTotal > 10000;
  }, [debts]);

  const creditCardCount = useMemo(
    () => debts.filter((d) => d.debtType === "creditCard").length,
    [debts]
  );

  const hasBusinessDebt = useMemo(
    () => debts.some((d) => isBusinessDebtType(d.debtType) && d.balance > 0),
    [debts]
  );

  const hasMissedPayment = useMemo(
    () => payments.some((p) => p.isMissed),
    [payments]
  );

  const updateDebt = useCallback(
    async (id: string, partial: Partial<Debt>) => {
      const updated = debts.map((d) =>
        d.id === id ? { ...d, ...partial } : d
      );
      setDebts(updated);
      // Await so abrupt crash/restart doesn't leave the secure store behind.
      await secureSetItem(DEBTS_KEY, JSON.stringify(updated));
    },
    [debts]
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      const updated = debts.filter((d) => d.id !== id);
      setDebts(updated);
      await secureSetItem(DEBTS_KEY, JSON.stringify(updated));
    },
    [debts]
  );

  const setExtraPayment = useCallback(async (amount: number) => {
    const safe =
      typeof amount === "number" && Number.isFinite(amount) && amount >= 0
        ? amount
        : 0;
    setExtraPaymentState(safe);
    await AsyncStorage.setItem(EXTRA_PAYMENT_KEY, String(safe));
  }, []);

  const setSelectedStrategy = useCallback(async (strategy: Strategy) => {
    setSelectedStrategyState(strategy);
    await AsyncStorage.setItem(SELECTED_STRATEGY_KEY, strategy);
  }, []);

  const setCustomOrder = useCallback(async (order: string[]) => {
    setCustomOrderState(order);
    await AsyncStorage.setItem(CUSTOM_ORDER_KEY, JSON.stringify(order));
  }, []);

  const logPayment = useCallback(
    async (log: Omit<PaymentLog, "id">) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const entry: PaymentLog = { ...log, id };
      const updated = [entry, ...payments];
      setPayments(updated);
      await secureSetItem(PAYMENTS_KEY, JSON.stringify(updated));

      if (!log.isMissed && log.amount > 0) {
        await updateDebt(log.debtId, {
          balance: Math.max(
            0,
            (debts.find((d) => d.id === log.debtId)?.balance ?? 0) - log.amount
          ),
        });
      }
    },
    [payments, debts, updateDebt]
  );

  const setWelcomeSkipped = useCallback(async (value: boolean) => {
    setWelcomeSkippedState(value);
    if (value) await AsyncStorage.setItem(WELCOME_SKIPPED_KEY, "1");
    else await AsyncStorage.removeItem(WELCOME_SKIPPED_KEY);
  }, []);

  const addDebt = useCallback(
    async (debt: Omit<Debt, "id" | "dateAdded">) => {
      const newDebt: Debt = {
        ...debt,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        dateAdded: new Date().toISOString(),
        isSecured: debt.isSecured ?? isSecuredByType(debt.debtType),
      };
      let nextList: Debt[] = [];
      let wasEmpty = false;
      setDebts((prev) => {
        wasEmpty = prev.length === 0;
        nextList = [...prev, newDebt];
        return nextList;
      });
      if (wasEmpty) {
        await setWelcomeSkipped(false);
      }
      await secureSetItem(DEBTS_KEY, JSON.stringify(nextList));
    },
    [setWelcomeSkipped]
  );

  const setOnboardingDone = useCallback(async () => {
    setOnboardingDoneState(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, "1");
  }, []);

  const setLeadSubmitted = useCallback(async () => {
    const now = new Date().toISOString();
    setLeadSubmittedAtState(now);
    await AsyncStorage.setItem(LEAD_SUBMITTED_KEY, now);
  }, []);

  const clearAllData = useCallback(async () => {
    setDebts([]);
    setPayments([]);
    setExtraPaymentState(0);
    setSelectedStrategyState("avalanche");
    setCustomOrderState([]);
    setOnboardingDoneState(false);
    setWelcomeSkippedState(false);
    setLeadSubmittedAtState(null);
    await Promise.all([
      secureRemoveItem(DEBTS_KEY),
      secureRemoveItem(PAYMENTS_KEY),
      AsyncStorage.removeItem(EXTRA_PAYMENT_KEY),
      AsyncStorage.removeItem(SELECTED_STRATEGY_KEY),
      AsyncStorage.removeItem(CUSTOM_ORDER_KEY),
      AsyncStorage.removeItem(LEAD_SUBMITTED_KEY),
      AsyncStorage.removeItem(ONBOARDING_KEY),
      AsyncStorage.removeItem(WELCOME_SKIPPED_KEY),
    ]);
  }, []);

  const value = useMemo<DebtContextValue>(
    () => ({
      debts,
      payments,
      extraPayment,
      selectedStrategy,
      customOrder,
      onboardingDone,
      welcomeSkipped,
      leadSubmittedAt,
      avalancheResult,
      snowballResult,
      customResult,
      activeResult,
      totalBalance,
      totalUnsecuredBalance,
      totalMinimums,
      hasHighAprDebt,
      hasTaxDebt,
      hasBusinessDebt,
      creditCardCount,
      hasMissedPayment,
      addDebt,
      updateDebt,
      deleteDebt,
      setExtraPayment,
      setSelectedStrategy,
      setCustomOrder,
      logPayment,
      setOnboardingDone,
      setWelcomeSkipped,
      setLeadSubmitted,
      clearAllData,
    }),
    [
      debts,
      payments,
      extraPayment,
      selectedStrategy,
      customOrder,
      onboardingDone,
      welcomeSkipped,
      leadSubmittedAt,
      avalancheResult,
      snowballResult,
      customResult,
      activeResult,
      totalBalance,
      totalUnsecuredBalance,
      totalMinimums,
      hasHighAprDebt,
      hasTaxDebt,
      hasBusinessDebt,
      creditCardCount,
      hasMissedPayment,
      addDebt,
      updateDebt,
      deleteDebt,
      setExtraPayment,
      setSelectedStrategy,
      setCustomOrder,
      logPayment,
      setOnboardingDone,
      setWelcomeSkipped,
      setLeadSubmitted,
      clearAllData,
    ]
  );

  if (!loaded) return null;

  return <DebtContext.Provider value={value}>{children}</DebtContext.Provider>;
}

export function useDebts() {
  const ctx = useContext(DebtContext);
  if (!ctx) throw new Error("useDebts must be used within DebtProvider");
  return ctx;
}
