import { useCallback, useRef } from "react";
import '../styles/DialogTemplate.css'
import {
    TextBoxComponent,
    NumericTextBoxComponent,
    UploaderComponent,
} from "@syncfusion/ej2-react-inputs";
import type { SelectedEventArgs } from "@syncfusion/ej2-inputs";
import {
    DropDownListComponent,
    MultiSelectComponent,
} from "@syncfusion/ej2-react-dropdowns";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import { CheckBoxComponent } from "@syncfusion/ej2-react-buttons";
import type { ExpenseRecord } from "../models/transaction-record";
import {
    TAG_OPTIONS,
    DEPARTMENTS,
    EXPENSE_CATEGORIES,
    PAYMENT_METHODS,
    CURRENCIES,
    STATUS_OPTIONS,
} from "../constants/lookups";

export const DialogTemplate: React.FC<ExpenseRecord> = (row) => {
  const avatarImgRef = useRef<HTMLImageElement | null>(null);
  const avatarHiddenRef = useRef<HTMLInputElement | null>(null);

  const onAvatarSelected = useCallback((args: SelectedEventArgs) => {
    const file = (args as SelectedEventArgs).filesData?.[0]?.rawFile as File | undefined;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (avatarHiddenRef.current) avatarHiddenRef.current.value = dataUrl;
      if (avatarImgRef.current) avatarImgRef.current.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const clearAvatar = useCallback(() => {
    if (avatarHiddenRef.current) avatarHiddenRef.current.value = "";
    if (avatarImgRef.current) avatarImgRef.current.src = "";
  }, []);

  return (
    <form className="expense-form">
      <div className="form-section">
        <h4>Employee</h4>

        <div className="employee-layout">
          <div className="id-name-column">
            <div className="form-item">
              <TextBoxComponent
                id="expenseId"
                name="expenseId"
                value={row.expenseId || ""}
                readonly={!!row.expenseId}
                placeholder="Expense ID"
                floatLabelType="Auto"
              />
            </div>

            <div className="form-item">
              <TextBoxComponent
                id="employeeName"
                name="employeeName"
                value={row.employeeName || ""}
                placeholder="Employee Name"
                floatLabelType="Auto"
              />
            </div>
          </div>

          <div className="form-item avatar-item">
            <label className="form-label">Employee Avatar</label>
            <div className="avatar-slot">
              <div className="avatar-inline-preview">
                <img
                  ref={avatarImgRef}
                  src={row.employeeAvatarUrl || ""}
                  alt="Avatar preview"
                />
                <button
                  type="button"
                  className="clear-avatar-btn"
                  aria-label="Clear avatar"
                  onClick={clearAvatar}
                >
                  &times;
                </button>
              </div>

              <div className="avatar-dropzone">
                <UploaderComponent
                  id="employeeAvatar"
                  name="employeeAvatar"
                  cssClass="avatar-uploader"
                  autoUpload={false}
                  multiple={false}
                  allowedExtensions=".png,.jpg,.jpeg,.gif"
                  selected={onAvatarSelected}
                />
                <input
                  type="hidden"
                  id="employeeAvatarUrlHidden"
                  name="employeeAvatarUrl"
                  ref={avatarHiddenRef}
                  defaultValue={row.employeeAvatarUrl || ""}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-item email-row">
          <TextBoxComponent
            type="email"
            id="employeeEmail"
            name="employeeEmail"
            value={row.employeeEmail || ""}
            placeholder="Email"
            floatLabelType="Auto"
          />
        </div>
      </div>

      {/* Expense */}
      <div className="form-section">
        <h4>Expense</h4>
        <div className="form-grid">
          <div className="form-item">
            <DropDownListComponent
              id="department"
              name="department"
              dataSource={DEPARTMENTS}
              value={row.department || null}
              placeholder="Department"
              allowFiltering
              floatLabelType="Auto"
            />
          </div>

          <div className="form-item">
            <DropDownListComponent
              id="category"
              name="category"
              dataSource={EXPENSE_CATEGORIES}
              value={row.category || null}
              placeholder="Category"
              allowFiltering
              floatLabelType="Auto"
            />
          </div>

          <div className="form-item">
            <NumericTextBoxComponent
              id="amount"
              name="amount"
              min={0}
              step={0.01}
              format="n2"
              placeholder="Amount"
              floatLabelType="Auto"
              value={row.amount ?? null}
            />
          </div>

          <div className="form-item">
            <NumericTextBoxComponent
              id="taxPct"
              name="taxPct"
              min={0}
              step={0.01}
              format="p2"
              placeholder="Tax %"
              floatLabelType="Auto"
              value={row.taxPct ?? null}
            />
          </div>

          <div className="form-item">
            <DatePickerComponent
              id="ExpenseDate"
              name="ExpenseDate"
              value={row.ExpenseDate ? new Date(row.ExpenseDate) : undefined}
              format="MM/dd/yyyy"
              placeholder="Expense Date"
              floatLabelType="Auto"
            />
          </div>

          <div className="form-item">
            <DropDownListComponent
              id="currency"
              name="currency"
              dataSource={CURRENCIES}
              value={row.currency || null}
              placeholder="Currency"
              allowFiltering
              floatLabelType="Auto"
            />
          </div>
        </div>
      </div>

      {/* Payment & Status */}
      <div className="form-section">
        <h4>Payment &amp; Status</h4>
        <div className="form-grid">
          <div className="form-item">
            <DropDownListComponent
              id="paymentMethod"
              name="paymentMethod"
              dataSource={PAYMENT_METHODS}
              value={row.paymentMethod || null}
              placeholder="Payment Method"
              allowFiltering
              floatLabelType="Auto"
            />
          </div>

          <div className="form-item">
            <DropDownListComponent
              id="reimbursementStatus"
              name="reimbursementStatus"
              dataSource={STATUS_OPTIONS}
              value={row.reimbursementStatus || null}
              placeholder="Status"
              allowFiltering
              floatLabelType="Auto"
            />
          </div>

          <div className="form-item span-2">
            <MultiSelectComponent
              id="tags"
              name="tags"
              dataSource={TAG_OPTIONS}
              mode="Box"
              value={row.tags || []}
              placeholder="Tags"
              allowFiltering
              floatLabelType="Auto"
            />
          </div>

          <div className="form-item policy-item">
            <CheckBoxComponent
              id="isPolicyCompliant"
              name="isPolicyCompliant"
              label="Under Policy"
              checked={!!row.isPolicyCompliant}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="form-section">
        <h4>Description</h4>
        <div className="form-item span-2">
          <TextBoxComponent
            id="description"
            name="description"
            multiline
            placeholder="Describe your expense"
            value={row.description || ""}
          />
        </div>
      </div>
    </form>
  );
};
