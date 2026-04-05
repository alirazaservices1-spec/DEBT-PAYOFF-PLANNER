import { Debt } from "@/lib/calculations";

/**
 * Sample debts for “Load sample data” (Settings / More).
 * Includes two credit cards with promotional APRs so intro / promo flows can be exercised.
 */
export const DEMO_DEBTS: Omit<Debt, "id" | "dateAdded">[] = [
  {
    name: "Chase Sapphire Card",
    balance: 8400,
    apr: 24.99,
    minimumPayment: 210,
    debtType: "creditCard",
    isSecured: false,
    dueDate: 15,
    introApr: 0,
    introEndsMonth: 10,
    introEndsYear: 2026,
  },
  {
    name: "Discover it Card",
    balance: 3200,
    apr: 19.99,
    minimumPayment: 80,
    debtType: "creditCard",
    isSecured: false,
    dueDate: 22,
    introApr: 3.99,
    introEndsMonth: 12,
    introEndsYear: 2026,
  },
  {
    name: "Wells Fargo Personal Loan",
    balance: 12500,
    apr: 14.5,
    minimumPayment: 320,
    debtType: "personalLoan",
    isSecured: false,
    dueDate: 10,
  },
  {
    name: "Navient Student Loan",
    balance: 22000,
    apr: 6.8,
    minimumPayment: 220,
    debtType: "studentLoan",
    isSecured: false,
    dueDate: 20,
  },
  {
    name: "IRS Payment Plan",
    balance: 4200,
    apr: 7,
    minimumPayment: 175,
    debtType: "taxDebt",
    isSecured: false,
    dueDate: 14,
    taxPaymentPlan: true,
  },
];
