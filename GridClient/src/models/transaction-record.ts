export interface ExpenseRecord {
  expenseId: string;
  employeeName: string;
  employeeEmail: string;
  employeeAvatarUrl: string;
  department: string;
  category: string;
  description: string;
  amount: number;
  taxPct: number;
  totalAmount: number;
  ExpenseDate: string;
  paymentMethod: string;
  currency: string;
  reimbursementStatus: 'Submitted' | 'UnderReview' | 'Approved' | 'Paid' | 'Rejected';
  isPolicyCompliant: boolean;
  tags: string[];
}

export type GroupCaptionData = {
  field: string;
  key: string | number | boolean | null; // removed Date
  count: number;
  headerText: string;
};