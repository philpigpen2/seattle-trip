export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  split: string[]; // names of people splitting this expense
  receiptUrl: string | null;
  notes: string;
  addedBy?: string;
  category?: string;
  paidBy?: string;
}

export interface ExpenseData {
  participants: string[];
  expenses: Expense[];
}
