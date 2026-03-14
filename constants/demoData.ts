import { Debt } from "@/lib/calculations";

export const DEMO_DEBTS: Omit<Debt, "id" | "dateAdded">[] = [
  {
    name: "Chase Sapphire Card",
    balance: 8400,
    apr: 24.99,
    minimumPayment: 210,
    debtType: "creditCard",
    isSecured: false,
    dueDate: 15,
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
    apr: 0,
    minimumPayment: 175,
    debtType: "taxDebt",
    isSecured: false,
    dueDate: 14,
  },
];
