export const DEPARTMENTS = ['Finance', 'HR & People', 'Engineering', 'Marketing', 'Sales', 'Operations'];
export const EXPENSE_CATEGORIES = ['Travel & Mileage', 'Meals & Entertainment', 'Office Supplies', 'Training & Education', 'Software & SaaS', 'Lodging'];
export const PAYMENT_METHODS = ['Corporate Card', 'Personal Card', 'Bank Transfer', 'Cash Advance'];
export const CURRENCIES = ['USD - US Dollar', 'EUR - Euro', 'GBP - Pound', 'JPY - Yen'];
export const STATUS_OPTIONS = ['Submitted', 'Under Review', 'Approved', 'Paid', 'Rejected'];
export const TAG_OPTIONS = ['Urgent', 'Client-Billable', 'Non-Billable', 'Conference', 'Recurring', 'Capital Expense'];

export const STATUS_BADGES: Record<string, { text: string; color: string }> = {
  Submitted: { text: 'Submitted', color: '#c7d2fe' },
  'Under Review': { text: 'Under Review', color: '#fde68a' },
  Approved: { text: 'Approved', color: '#a7f3d0' },
  Paid: { text: 'Paid', color: '#bae6fd' },
  Rejected: { text: 'Rejected', color: '#fecaca' }
};