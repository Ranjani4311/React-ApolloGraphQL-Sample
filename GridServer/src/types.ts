export interface ExpenseRecord {
  expenseId: string;
  employeeName: string;
  employeeEmail: string;
  employeeAvatarUrl?: string;
  department: string;
  category: string;
  description?: string;
  amount: number;
  taxPct: number;
  totalAmount: number;
  expenseDate: string;
  paymentMethod: string;
  currency: string;
  reimbursementStatus: 'Submitted' | 'Under Review' | 'Approved' | 'Paid' | 'Rejected';
  isPolicyCompliant: boolean;
  tags: string[];
}

export interface AvatarEntry {
  FileName: string;
  Base64Data: string;
};

export type ExpenseInput = Omit<ExpenseRecord, 'expenseId'>;