import { ExpenseRecord, ExpenseInput, AvatarEntry } from './types';
import { v4 as uuid } from 'uuid';
import avatarData from './avatars_base64.json';

const FIRST_NAMES = ['Jane', 'Mark', 'Olivia', 'Ethan', 'Sophia', 'Liam', 'Ava', 'Noah', 'Mia', 'Lucas'];
const LAST_NAMES = ['Smith', 'Johnson', 'Davis', 'Brown', 'Garcia', 'Miller', 'Wilson', 'Martinez', 'Anderson', 'Clark'];

const DEPARTMENTS = ['Finance', 'HR & People', 'Engineering', 'Marketing', 'Sales', 'Operations'];
const CATEGORIES = ['Travel & Mileage', 'Meals & Entertainment', 'Office Supplies', 'Training & Education', 'Software & SaaS', 'Lodging'];

const CATEGORY_DESCRIPTIONS: Record<string, string[]> = {
  'Travel & Mileage': [
    'Mileage reimbursement for regional client visits',
    'Cab fare for airport transfer during client onsite',
    'Fuel expense submitted after sales road trip',
    'Ride-share to partner meeting downtown'
  ],
  'Meals & Entertainment': [
    'Team lunch with client account executives',
    'Customer dinner during product demo tour',
    'Event catering invoice for investor briefing',
    'Coffee meetup with channel partner'
  ],
  'Office Supplies': [
    'Bulk stationery order for HQ workspace',
    'Printer ink cartridges for finance pod',
    'Whiteboard markers and notebooks restock',
    'Desk accessories purchase for new hires'
  ],
  'Training & Education': [
    'Conference registration fee for leadership summit',
    'Online course subscription for certifications',
    'Workshop materials for internal enablement',
    'Tuition reimbursement for professional development'
  ],
  'Software & SaaS': [
    'Monthly license renewal for analytics suite',
    'Productivity app subscription for marketing',
    'Security software upgrade and support',
    'Design tool seat assignment for creative team'
  ],
  'Lodging': [
    'Hotel stay for cross-country sales visit',
    'Accommodation invoice for training week',
    'Business travel lodging near client HQ',
    'Extended stay for project deployment'
  ]
};

const PAYMENT_METHODS = ['Corporate Card', 'Personal Card', 'Bank Transfer', 'Cash Advance'];
const CURRENCIES = ['USD - US Dollar', 'EUR - Euro', 'GBP - Pound', 'JPY - Yen'];
const STATUSES: ExpenseRecord['reimbursementStatus'][] = ['Submitted', 'Under Review', 'Approved', 'Paid', 'Rejected'];
const TAG_OPTIONS = ['Urgent', 'Client-Billable', 'Non-Billable', 'Conference', 'Recurring', 'Capital Expense'];

const AVATARS = (avatarData as AvatarEntry[]).map(({ Base64Data }) => `data:image/jpeg;base64,${Base64Data}`);

function randomAvatarUrl(): string {
  return pick(AVATARS);
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function randomTags(): string[] {
  const shuffled = [...TAG_OPTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.floor(Math.random() * 3)).sort();
}

function randomAmount(): number {
  const base = Math.random() * 1960 + 40; // 40 - 2000
  return Number(base.toFixed(2));
}

function randomTaxPct(): number {
  const pct = Math.random() * 0.1 + 0.02; // 2% - 12%
  return Number(pct.toFixed(4));
}

/**
 * Returns start/end UTC dates covering the previous three full months.
 */
function getReportingWindow(): { startUtc: Date; endUtc: Date } {
  const today = new Date();
  const currentMonth = today.getUTCMonth();
  const currentYear = today.getUTCFullYear();

  const startMonthIndex = currentMonth - 3;
  const startDate = new Date(Date.UTC(currentYear, startMonthIndex, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(currentYear, currentMonth, 0, 0, 0, 0, 0));

  return { startUtc: startDate, endUtc: endDate };
}

/**
 * Picks a random UTC midnight date in the supplied range.
 */
function randomDateInRangeUTC(startUtc: Date, endUtc: Date): string {
  const dayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((endUtc.getTime() - startUtc.getTime()) / dayMs);
  const offsetDays = Math.floor(Math.random() * (totalDays + 1));
  const result = new Date(startUtc.getTime() + offsetDays * dayMs);
  return result.toISOString();
}

function generateExpenses(count = 200): ExpenseRecord[] {
  const { startUtc, endUtc } = getReportingWindow();

  return Array.from({ length: count }).map((_, idx) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const amount = randomAmount();
    const taxPct = randomTaxPct();
    const category = pick(CATEGORIES);
    const descriptionPool = CATEGORY_DESCRIPTIONS[category] ?? ['Expense submitted'];

    return {
      expenseId: `EXP${202400 + idx}`,
      employeeName: `${first} ${last}`,
      employeeEmail: `${first}.${last}@example.com`.toLowerCase(),
      employeeAvatarUrl: randomAvatarUrl(),
      department: pick(DEPARTMENTS),
      category,
      description: pick(descriptionPool),
      amount,
      taxPct,
      totalAmount: Number((amount * (1 + taxPct)).toFixed(2)),
      expenseDate: randomDateInRangeUTC(startUtc, endUtc),
      paymentMethod: pick(PAYMENT_METHODS),
      currency: pick(CURRENCIES),
      reimbursementStatus: pick(STATUSES),
      isPolicyCompliant: Math.random() > 0.2,
      tags: randomTags()
    };
  });
}

export const expenses: ExpenseRecord[] = generateExpenses(1500);

export function addExpense(value: ExpenseInput): ExpenseRecord {
  const expense: ExpenseRecord = { expenseId: uuid(), ...value };
  expenses.push(expense);
  return expense;
}

export function updateExpense(key: string, value: Partial<ExpenseRecord>): ExpenseRecord | null {
  const index = expenses.findIndex((item) => item.expenseId === key);
  if (index === -1) return null;
  expenses[index] = { ...expenses[index], ...value };
  return expenses[index];
}

export function removeExpense(key: string): boolean {
  const index = expenses.findIndex((item) => item.expenseId === key);
  if (index === -1) return false;
  expenses.splice(index, 1);
  return true;
}