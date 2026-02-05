import GraphQLJSON from 'graphql-type-json';
import { DataManager, Query, DataUtil, Predicate } from '@syncfusion/ej2-data';
import { expenses } from './data';
import { ExpenseRecord, GetExpensesArgs, ExpenseInput,ExpenseArgs, DataManagerInput, FilterBlock, FilterPredicate } from './types';

DataUtil.serverTimezoneOffset = 0;

// ---------- Utility helpers ----------
function parseArg<T = any>(arg?: string | T): T | undefined {
  if (arg === undefined || arg === null) return undefined;
  if (typeof arg === 'string') {
    try {
      return JSON.parse(arg);
    } catch {
      return undefined;
    }
  }
  return arg;
}

function buildPredicate(predicate: FilterBlock): Predicate | null {
  if (!predicate) return null;

  if (predicate.isComplex && Array.isArray(predicate.predicates)) {
    const children = predicate.predicates
      .map((child: any) => buildPredicate(child))
      .filter(Boolean) as Predicate[];

    if (!children.length) return null;

    return children.reduce((acc, curr, idx) => {
      if (idx === 0) return curr;
      return predicate.condition?.toLowerCase() === 'or' ? acc.or(curr) : acc.and(curr);
    });
  }

  if (predicate.field) {
    return new Predicate(predicate.field, predicate.operator, predicate.value, predicate.ignoreCase, predicate.ignoreAccent);
  }

  return null;
}

// ---------- Feature-specific helpers ----------
function performFiltering(query: Query, datamanager: DataManagerInput) {
  const whereArg = parseArg<any[]>(datamanager?.where);
  if (Array.isArray(whereArg) && whereArg.length) {
    const rootPredicate = buildPredicate(whereArg[0]);
    if (rootPredicate) {
      query.where(rootPredicate);
    }
  }
}

function performSearching(query: Query, datamanager: DataManagerInput) {
  const searchArg = parseArg<any[]>(datamanager?.search);
  if (Array.isArray(searchArg) && searchArg.length) {
    const { fields, key, operator, ignoreCase } = searchArg[0];
    if (key && Array.isArray(fields) && fields.length) {
      query.search(key, fields, operator, ignoreCase);
    }
  }
}


function performSorting(query: Query, datamanager: DataManagerInput) {
  const sortedArg = datamanager?.sorted;
  if (Array.isArray(sortedArg)) {
    sortedArg.forEach(({ name, direction }) => {
      query.sortBy(name, direction);
    });
  }
}

function performPaging( data: ExpenseRecord[], datamanager?: DataManagerInput): ExpenseRecord[] {
  if (
    typeof datamanager?.skip === 'number' &&
    typeof datamanager?.take === 'number'
  ) {
    const pageQuery = new Query().page(
      datamanager.skip / datamanager.take + 1,
      datamanager.take
    );
    return new DataManager(data).executeLocal(pageQuery) as ExpenseRecord[];
  }

  if (typeof datamanager?.take === 'number') {
    const pageQuery = new Query().page(1, datamanager.take);
    return new DataManager(data).executeLocal(pageQuery) as ExpenseRecord[];
  }

  return data;
}

// ---------- Resolvers ----------
export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    /**
   * Retrieves expenses using Syncfusion DataManager semantics.
   *
   * Behavior:
   * - Clones the in-memory dataset.
   * - Builds a `Query` and applies filtering, searching, and sorting
   *   based on the incoming `datamanager` (Syncfusion `DataStateChangeEventArgs`).
   * - Executes the query locally to get the transformed dataset.
   * - Computes the total `count` **before paging** (used for grid pagination).
   * - Applies paging and returns the current page `result` along with `count`.
   *
   * @param _ - Unused. Present to satisfy the GraphQL resolver signature.
   * @param datamanager - Grid state (filtering, searching, sorting, skip/take, etc.).
   * @returns An object containing the paged `result` and the total `count` (pre-paging).
   */
    getExpenses: (_: unknown, { datamanager }: GetExpensesArgs) => {
      let data: ExpenseRecord[] = [...expenses];
      const query = new Query();

      performFiltering(query, datamanager);
      performSearching(query, datamanager);
      performSorting(query, datamanager);
      
      data = new DataManager(data).executeLocal(query) as ExpenseRecord[];
      const count = data.length;

      data = performPaging(data, datamanager);

      return { result: data, count };
    },
  },
  Mutation: {
    /**
     * Creates a new expense record.
     *
     * Behavior:
     * - Accepts an `ExpenseInput` object as `value`.
     * - Pushes the object directly into the in‑memory `expenses` array.
     * - Does not auto‑generate fields (e.g., `expenseId`); the client must supply them.
     * - Returns the newly added expense as-is.
     *
     * @param _ - Unused. Present only to satisfy the GraphQL resolver signature.
     * @param value - The full expense payload to insert into the dataset.
     * @returns The newly created `ExpenseRecord`.
    */
    addExpense: (_: unknown, { value }: { value: ExpenseInput }): ExpenseRecord => { 
      expenses.push(value as ExpenseRecord);
      return value as ExpenseRecord;
    },
     
    /**
     * Update an existing expense by a dynamic key column.
     *
     * Performs an in-place merge of the provided `value` into the matched expense.
     *
     * @param _parent - Unused, kept for GraphQL resolver signature consistency.
     * @param args.key - The lookup key value (e.g., an expenseId or other field).
     * @param args.keyColumn - The field name to match against (defaults to "expenseId").
     * @param args.value - Partial fields to merge into the existing expense.
   */
    updateExpense: (_parent: unknown,{ key, keyColumn = "expenseId", value }: ExpenseArgs): ExpenseRecord => {

      // 1. Find the expense dynamically using the given key column
      const expense = expenses.find(
        (e: ExpenseRecord | any) => String(e[keyColumn]) === String(key)
      );

      if (!expense) throw new Error("Expense not found");

      // 2. Merge incoming partial fields into the existing expense
      Object.assign(expense, value);

      // 3. Return the updated object
      return expense;
    },
    
    /**
     * Delete an existing expense by a dynamic key column.
     *
     * Removes the matched expense from the in-memory list and returns the removed object.
     *
     * @param _parent - Unused, kept for GraphQL resolver signature consistency.
     * @param args.key - The lookup key value (e.g., an expenseId or other field).
     * @param args.keyColumn - The field name to match against (defaults to "expenseId").
     * @returns The deleted expense object.
   */
   deleteExpense: (_parent: unknown, { key, keyColumn = 'expenseId' }: ExpenseArgs) => {
      const idx = expenses.findIndex((e: ExpenseRecord | any) => String(e[keyColumn]) === String(key));
      if (idx === -1) throw new Error('Expense not found');
      const [removed] = expenses.splice(idx, 1);
      // Return the Expense directly to match `Expense!`
      return removed;
    }
  },
};