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


export interface ExpenseArgs<K extends keyof ExpenseRecord = 'expenseId'> {
  key: ExpenseRecord[K];
  keyColumn?: K;
  value: Partial<Omit<ExpenseRecord, 'expenseId'>>;
}

// Leaf predicate
export interface FilterPredicate {
  field: string;
  operator: string;
  value: any;
  ignoreCase?: boolean;
  ignoreAccent?: boolean; // add this if you pass it to Syncfusion's Predicate
}

// Block (composite) predicate
export interface FilterBlock {
  condition?: 'and' | 'or';
  field: string;
  value: string;
  ignoreAccent?: boolean;
  operator: string;
  ignoreCase?: boolean; // optional block-level flag
  isComplex?: boolean;  // optional marker (not strictly needed for type narrowing)
  predicates: (FilterPredicate | FilterBlock)[];
}

export interface AvatarEntry {
  FileName: string;
  Base64Data: string;
};

export interface ExpenseInput {
  expenseId: string;      // ID (optional – often generated server-side)
  employeeName: string;
  employeeEmail: string;
  employeeAvatarUrl: string;
  department: string;
  category: string;
  description: string;
  receiptUrl: string;
  amount: number;
  taxPct: number;
  totalAmount: number;
  expenseDate: string;
  paymentMethod: string;
  currency: string;
  reimbursementStatus: string;
  isPolicyCompliant: boolean;
  tags: string[];
}

export interface SortParam {
  name: string;
  direction: 'asc' | 'desc' | string; // adjust if needed
}

export interface DataManagerInput {
  skip: number
  take: number
  group: string[]
  sorted?: string | SortParam[];   // ⬅ Accept string OR array
  search?: string ; // ⬅ Accept string OR array
  where: string      
  requiresCounts: boolean
  aggregates: string[]
  params: string
}

export interface GetExpensesArgs {
  datamanager: DataManagerInput;
}