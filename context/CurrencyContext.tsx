import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENCY_KEY = "@debtfree_currency";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  symbolAfter?: boolean;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  // Essential 20, sorted alphabetically for easier scanning.
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", locale: "pt-BR" },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA" },
  { code: "CNY", symbol: "CN¥", name: "Chinese Yuan", locale: "zh-CN" },
  { code: "COP", symbol: "COP$", name: "Colombian Peso", locale: "es-CO" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", locale: "zh-HK" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", locale: "es-MX" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", locale: "en-NZ" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
  { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", locale: "ko-KR" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", locale: "sv-SE", symbolAfter: true },
  { code: "CHF", symbol: "CHF ", name: "Swiss Franc", locale: "de-CH" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", locale: "tr-TR" },
  { code: "AED", symbol: "AED ", name: "United Arab Emirates Dirham", locale: "en-AE" },
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
];

interface CurrencyContextValue {
  currency: CurrencyConfig;
  setCurrency: (code: string) => Promise<void>;
  fmt: (n: number) => string;
  fmtFull: (n: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function makeFmt(c: CurrencyConfig) {
  return (n: number, decimals = 0): string => {
    const abs = Math.abs(n);
    let formatted: string;
    try {
      formatted = new Intl.NumberFormat(c.locale, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(abs);
    } catch {
      formatted = abs.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    const sign = n < 0 ? "-" : "";
    return c.symbolAfter
      ? `${sign}${formatted}${c.symbol}`
      : `${sign}${c.symbol}${formatted}`;
  };
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(
    SUPPORTED_CURRENCIES.find((c) => c.code === "USD") ?? SUPPORTED_CURRENCIES[0]
  );

  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_KEY).then((code) => {
      if (code) {
        const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
        if (found) setCurrencyState(found);
      }
    });
  }, []);

  const setCurrency = useCallback(async (code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (!found) return;
    setCurrencyState(found);
    await AsyncStorage.setItem(CURRENCY_KEY, code);
  }, []);

  const fmtBase = makeFmt(currency);
  const fmt = (n: number) => fmtBase(n, 0);
  const fmtFull = (n: number) => fmtBase(n, 2);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt, fmtFull }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be inside CurrencyProvider");
  return ctx;
}
