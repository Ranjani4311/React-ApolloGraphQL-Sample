import GraphQLJSON from 'graphql-type-json';
import { DataManager, Query, DataUtil, Predicate } from '@syncfusion/ej2-data';
import { expenses } from './data';
import { ExpenseRecord } from './types';

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

function buildPredicate(predicate: any): Predicate | null {
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
function performFiltering(query: Query, datamanager: any) {
  const whereArg = parseArg<any[]>(datamanager?.where);
  if (Array.isArray(whereArg) && whereArg.length) {
    const rootPredicate = buildPredicate(whereArg[0]);
    if (rootPredicate) {
      query.where(rootPredicate);
    }
  }
}

function performSearching(query: Query, datamanager: any) {
  const searchArg = parseArg<any[]>(datamanager?.search);
  if (Array.isArray(searchArg) && searchArg.length) {
    const { fields, key, operator, ignoreCase } = searchArg[0];
    if (key && Array.isArray(fields) && fields.length) {
      query.search(key, fields, operator, ignoreCase);
    }
  }
}


function performSorting(query: Query, datamanager: any) {
  const sortedArg = datamanager?.sorted;
  if (Array.isArray(sortedArg)) {
    sortedArg.forEach(({ name, direction }) => {
      query.sortBy(name, direction);
    });
  }
}

// ---------- Resolvers ----------
export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    getExpenses: (_: unknown, { datamanager }: any) => {
      let data: ExpenseRecord[] = [...expenses];
      const query = new Query();

      performFiltering(query, datamanager);
      performSearching(query, datamanager);
      performSorting(query, datamanager);

      const count = data.length;

      if (datamanager.take !== undefined) {
        const skip = datamanager.skip || 0;
        const take = datamanager.take;

        query.page(skip / take + 1, take);
       
      }
      
      data = new DataManager(data).executeLocal(query) as ExpenseRecord[];;

      return { result: data, count };
    },
  },
  Mutation: {
    /**
     * Create a new expense.
     *
     * @param _parent - Unused, kept for GraphQL resolver signature consistency.
     * @param args - Arguments containing the `value` payload for the new expense.
     * @returns The newly created expense object.
    */
    addExpense: (_: unknown, { value }: any) => {
      expenses.push(value);
      return value;
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
    updateExpense: (_parent: unknown,{ key, keyColumn = "expenseId", value }: any): ExpenseRecord => {

      // 1. Find the expense dynamically using the given key column
      const expense = expenses.find(
        (e: ExpenseRecord|any) => String(e[keyColumn]) === String(key)
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
   deleteExpense: (_parent: any, { key, keyColumn = 'expenseId' }: any) => {
      const idx = expenses.findIndex((e: ExpenseRecord|any) => String(e[keyColumn]) === String(key));
      if (idx === -1) throw new Error('Expense not found');
      const [removed] = expenses.splice(idx, 1);
      // Return the Expense directly to match `Expense!`
      return removed;
    }
  },
};