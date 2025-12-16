export type TransactionType = 'income' | 'expense_fixed' | 'expense_variable';

export interface Category {
  id: string;
  name: string;
  icon: string; // Nome do ícone Lucide
  type: 'income' | 'expense' | 'both';
}

export interface Transaction {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  isRecurring?: boolean;
  installment?: {
    current: number;
    total: number;
  };
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  fixedExpenses: number;
  variableExpenses: number;
  categoryData: { name: string; value: number }[];
}

export interface AIAdviceResponse {
  summary?: string; // Short summary for dashboard
  fullAnalysis?: { // Detailed analysis for consultant screen
    healthScore: number;
    analysis: string;
    cutSuggestions: string[];
    investmentTips: string[];
    status: 'Crítico' | 'Alerta' | 'Saudável';
  };
}