import React, { useMemo, useRef, useCallback } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter,
  Group,
  Search,
  Toolbar,
  Edit,
} from "@syncfusion/ej2-react-grids";
import type { SaveEventArgs, DialogEditEventArgs } from "@syncfusion/ej2-grids";
import { DataManager, GraphQLAdaptor } from "@syncfusion/ej2-data";
import { DialogTemplate } from "./DialogTemplate";
import type { ExpenseRecord, GroupCaptionData } from "../models/transaction-record";
import { STATUS_BADGES } from "../constants/lookups";
import "../styles/ExpenseGrid.css";

const menuFilter = { type: "Menu" as const };
const checkboxFilter = { type: "CheckBox" as const };
function formatCurrency(amount: number, currencyLabel: string): string {
  const currencyCode = currencyLabel?.split("-")[0].trim() || "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount ?? 0);
}

const ExpenseGrid: React.FC = () => {
  const gridRef = useRef<GridComponent>(null); 

  const expensesService = useMemo(() => {
    return new DataManager({
      url: "http://localhost:4000/",
      crossDomain:true,
      adaptor: new GraphQLAdaptor({
        response: { result: "getExpenses.result", count: "getExpenses.count" },
        query: `
          query getExpenses($datamanager: DataManagerInput) {
            getExpenses(datamanager: $datamanager) {
              count
              result {
                expenseId
                employeeName
                employeeEmail
                employeeAvatarUrl
                department
                category
                description
                receiptUrl
                amount
                taxPct
                totalAmount
                expenseDate
                paymentMethod
                currency
                reimbursementStatus
                isPolicyCompliant
                tags
              }
            }
          }
        `,
        getMutation: (action: string) => {
          if (action === "insert") {
            return `
              mutation addExpense($value: ExpenseInput!) {
                addExpense(value: $value) {
                  expenseId
                  employeeName
                employeeEmail
                employeeAvatarUrl
                department
                category
                description
                receiptUrl
                amount
                taxPct
                totalAmount
                expenseDate
                paymentMethod
                currency
                reimbursementStatus
                isPolicyCompliant
                tags
                  
                }
              }
            `;
          }
          if (action === "update") {
            return `
              mutation updateExpense($key: ID!, $keyColumn: String, $value: ExpenseInput!) {
                updateExpense(key: $key, keyColumn: $keyColumn, value: $value) {
                  expenseId
                }
              }
            `;
          }
          return `
            mutation RemoveDeleteExpense($key: String!, $keyColumn: String) {
              deleteExpense(key: $key, keyColumn: $keyColumn){
              expenseId,employeeName,employeeEmail,employeeAvatarUrl,department,category,description,receiptUrl,amount,taxPct,totalAmount,expenseDate,paymentMethod,currency,reimbursementStatus,isPolicyCompliant,tags   
              }
            }
          `;
        },
      }),
    });
  }, []);

  const pageSettings = { pageSize: 10, pageSizes: true };
  const filterSettings = { type: "Excel" as const };
  const searchSettings = {
    fields: [
      "expenseId",
      "employeeName",
      "employeeEmail",
      "department",
      "category",
      "paymentMethod",
      "tags",
    ],
  };

  const groupSettings = {
    showDropArea: true,
    captionTemplate: (data: GroupCaptionData) => {
      if (data.field === "isPolicyCompliant") {
        const yes = !!data.key;
        return (
          <div
            className={`policy-group-caption ${
              yes ? "policy-yes" : "policy-no"
            }`}
          >
            <span className="label">
              {yes ? "Under Policy" : "Not Under Policy"}
            </span>
            <span className="count">
              {" "}
              — {data.count} item{data.count === 1 ? "" : "s"}
            </span>
          </div>
        );
      }
      return (
        <span className="groupItems">
          {data.headerText} - {data.key} : {data.count} item
          {data.count === 1 ? "" : "s"}
        </span>
      );
    },
  };
  const toolbar: string[] = ["Add", "Edit", "Delete", "Search"];
  const editSettings = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: "Dialog" as const,
    template: (props: ExpenseRecord) => <DialogTemplate {...props} />,
  };


  const actionBegin = useCallback((args: SaveEventArgs) => {
    debugger
    
    if (args.requestType !== "save" || !(args as SaveEventArgs).form) return;

    const form = (args as SaveEventArgs).form as HTMLFormElement;

    const getVal = (
      selector: string,
      key: "value" | "checked" = "value"
    ): any => {
      const el = form.querySelector(selector) as any;
      const inst = el?.ej2_instances?.[0];
      return inst ? inst[key] : el?.[key];
    };

  // ────────────────────────────────────────────────
  // Collect ALL fields that the backend expects
  // ────────────────────────────────────────────────
  const collectedData: Partial<ExpenseRecord> | any = {
    expenseId:        getVal("#expenseId") || undefined,    
    employeeName:     getVal("#employeeName") || "",
    employeeEmail:    getVal("#employeeEmail") || "",
    department:       getVal("#department") || null,
    category:         getVal("#category") || null,
    description:      getVal("#description") || "",
    amount:           Number(getVal("#amount") ?? 0),
    taxPct:           Number(getVal("#taxPct") ?? 0),
    totalAmount:      0, // will be recalculated below
    ExpenseDate:      getVal("#expenseDate") 
                        ? new Date(getVal("#expenseDate")).toISOString().split("T")[0] 
                        : undefined,
    paymentMethod:    getVal("#paymentMethod") || null,
    currency:         getVal("#currency") || "USD",
    reimbursementStatus: getVal("#reimbursementStatus") || "Pending",
    isPolicyCompliant: !!getVal("#isPolicyCompliant", "checked"),
    tags:             getVal("#tags") || [],
    employeeAvatarUrl: (form.querySelector("#employeeAvatarUrlHidden") as HTMLInputElement)?.value || "",
  };

  // Calculate totalAmount (backend might do this too, but safer to send consistent value)
  collectedData.totalAmount = collectedData.amount + 
    (collectedData.amount * (collectedData.taxPct || 0));

  // For new records → make sure required fields are not empty
  // (you can also add more client-side validation here if you want)
  if (!collectedData.employeeName.trim()) {
    // Optional: show your own message or prevent save
    args.cancel = true;
    alert("Employee Name is required");
    return;
  }
  if (!collectedData.employeeEmail.trim()) {
    args.cancel = true;
    alert("Employee Email is required");
    return;
  }
 
 (args as SaveEventArgs).data = {
    ...(args as any).data,
    ...collectedData,
  };
}, []);


  const actionComplete = useCallback((args: DialogEditEventArgs) => {
    if (args.requestType === "beginEdit" || args.requestType === "add") {
      const formObj = (args.form as any)?.ej2_instances?.[0];
      if (formObj?.addRules) {
        formObj.addRules("expenseId", {
          required: [true, "Expense ID is required."],
        });
        formObj.addRules("employeeName", {
          required: [true, "Employee name is required."],
          minLength: [5, "Employee name must be at least 5 characters."],
          maxLength: [30, "Employee name cannot exceed 30 characters."],
        });
        formObj.addRules("employeeEmail", {
          required: [true, "Email is required."],
          email: [true, "Enter a valid email address."],
        });
        formObj.addRules("amount", {
          required: [true, "Amount is required."],
          min: [1, "Amount must be greater than 0."],
        });
      
        formObj.addRules('taxPct', {
          required: [true, 'Tax % is required.'],

          // Use a single custom rule to validate the numeric range
          custom: [
            () => {
              const input = document.querySelector('#taxPct') as any;
              const inst = input?.ej2_instances?.[0];     // EJ2 NumericTextBox instance
              if (!inst) return false;                    // no instance => invalid
              const v = inst.value;                       // numeric underlying value (0.5 for 50%)
              if (v == null || isNaN(v)) return false;
              return v >= 0.02 && v <= 0.50;              // 2% to 12%
            },
            'Tax % must be between 2% and 50%.'
          ]
        });

      }
      if ((args as DialogEditEventArgs).dialog) (args as any).dialog.width = 600;
    }
  }, []);

  const employeeTemplate = (data: ExpenseRecord) => (
    <div className="employee-cell">
      <img
        src={data.employeeAvatarUrl || ""}
        alt={data.employeeName || "Avatar"}
      />
      <div>
        <div className="name">{data.employeeName}</div>
        <div className="email">{data.employeeEmail}</div>
      </div>
    </div>
  );
  const amountTemplate = (data: ExpenseRecord) => (
    <span>{formatCurrency(data.amount ?? 0, data.currency || "USD")}</span>
  );
  const totalAmountTemplate = (data: ExpenseRecord) => (
    <span>{formatCurrency(data.totalAmount ?? 0, data.currency || "USD")}</span>
  );
  const statusTemplate = (data: ExpenseRecord) => {
    const badge =
      STATUS_BADGES[data.reimbursementStatus as keyof typeof STATUS_BADGES];
    const bg = badge?.color || "#ddd";
    return (
      <span className="status-pill" style={{ background: bg }}>
        {data.reimbursementStatus}
      </span>
    );
  };
  const tagsTemplate = (data: ExpenseRecord) => {
    if (!data.tags || data.tags.length === 0) return <span>--</span>;
    return (
      <>
        {data.tags.map((t, idx) => (
          <span className="tag-pill" key={`${t}-${idx}`}>
            {t}
          </span>
        ))}
      </>
    );
  };
  const policyFilterItemTemplate = (value: boolean) => (
    <span>{value ? "Under Policy" : "Not Under Policy"}</span>
  );

  return (
    <div className="app-container">
      <GridComponent
        ref={gridRef}
        dataSource={expensesService}
        height={520}
        toolbar={toolbar}
        allowPaging
        allowSorting
        allowFiltering
        allowGrouping
        allowTextWrap
        pageSettings={pageSettings}
        filterSettings={filterSettings}
        searchSettings={searchSettings}
        groupSettings={groupSettings}
        editSettings={editSettings}
        actionBegin={actionBegin}
        actionComplete={actionComplete}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="expenseId"
            headerText="Expense ID"
            width={130}
            textAlign="Center"
            isPrimaryKey
          />
          <ColumnDirective
            field="employeeName"
            headerText="Employee"
            width={250}
            template={employeeTemplate}
          />
          <ColumnDirective
            field="department"
            headerText="Department"
            width={150}
          />
          <ColumnDirective
            field="category"
            headerText="Category"
            width={160}
            filter={checkboxFilter}
          />
          <ColumnDirective
            field="currency"
            headerText="Currency"
            width={150}
            filter={checkboxFilter}
          />
          <ColumnDirective
            field="amount"
            headerText="Amount"
            width={130}
            textAlign="Right"
            filter={menuFilter}
            template={amountTemplate}
          />
          <ColumnDirective
            field="taxPct"
            headerText="Tax %"
            width={110}
            textAlign="Right"
            format="P2"
            filter={menuFilter}
          />
          <ColumnDirective
            field="totalAmount"
            headerText="Total (Incl. Tax)"
            width={160}
            textAlign="Right"
            allowEditing={false}
            filter={menuFilter}
            template={totalAmountTemplate}
          />
          <ColumnDirective
            field="reimbursementStatus"
            headerText="Status"
            width={140}
            textAlign="Center"
            filter={checkboxFilter}
            template={statusTemplate}
          />
          <ColumnDirective
            field="tags"
            headerText="Tags"
            width={220}
            template={tagsTemplate}
          />
          <ColumnDirective
            field="expenseDate"
            headerText="Expense Date"
            width={150}
            type="date"
            format="yMd"
            textAlign="Center"
            filter={menuFilter}
          />
          <ColumnDirective
            field="paymentMethod"
            headerText="Payment Method"
            width={170}
            filter={checkboxFilter}
          />
          <ColumnDirective
            field="isPolicyCompliant"
            headerText="Under Policy"
            width={120}
            type="boolean"
            displayAsCheckBox
            textAlign="Center"
            filter={{
              ...checkboxFilter,
              itemTemplate: policyFilterItemTemplate,
            }}
          />
          <ColumnDirective
            field="description"
            headerText="Description"
            width={240}
            clipMode="EllipsisWithTooltip"
          />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Group, Search, Toolbar, Edit]} />
      </GridComponent>
    </div>
  );
};

export default ExpenseGrid;
