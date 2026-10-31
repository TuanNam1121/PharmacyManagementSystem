# Bug Report & Update Tasks: Admin Modules

> **CRITICAL SCOPE LIMITATION:** 
> All modifications **MUST BE STRICTLY RESTRICTED** to the **Admin Modules** only (specifically: **Account Management**, **Product Management**, and **Category Management**). Do **NOT** modify or generate code for any other modules, common components, or shared logic outside this scope.

---

## 1. Investigation Phase (Mandatory Prior Action)

Before implementing any code changes or fix closures, **an investigation must be conducted to verify whether each issue is a true bug or expected behavior.**

### A. Price Update & Product Inactivation Functionality
* **Reported Issue:** Clicking on sub-items/dropdown options for "Set/Update Product Price" and "Inactive Product" does not trigger any action. Suspected UI bug.
* **Action Required:** 
  1. Investigate and confirm if click/event listeners (`onClick`, event propagation, `z-index`, overlay blocks) are failing or if the action handler is missing.
  2. Document findings before concluding if this is an actual bug.

### B. Status Field Audit across Admin Modules
* **Reported Issue:** The `Status` field may be incorrectly placed or displayed across Admin forms. Specifically, the `Status` field on the **Edit Product** form is reported as incorrect.
* **Action Required:**
  1. Inspect the UI layouts for **Account Management**, **Product Management**, and **Category Management**.
  2. Confirm whether the `Status` field currently exists in these forms and verify if its presence contradicts the product/business specifications.

### C. Data Pre-population in Edit Forms
* **Reported Issue:** When opening the Edit form for an existing record, some data fields are not being populated from the selected object (e.g., Edit Account form is missing `Date of Birth` and `Address`).
* **Action Required:**
  1. Inspect the state management and data-binding logic when passing row data into the edit modal/form.
  2. Verify if `Date of Birth` and `Address` are missing from the API payload or simply omitted in the form mapping logic.

---

## 2. Scope of Work & Action Plan

*(To be executed upon confirming the issues during the investigation phase)*

### Task 1: Fix UI Interaction for Price Update & Product Inactivation
* **Target Module:** `Product Management` (Admin)
* **Action:** Fix event handlers, pointer-events, or event propagation issues so clicking sub-items properly activates the modal/action.

### Task 2: Remove Invalid `Status` Fields
* **Target Module:** `Product Management` (Admin) — Edit Product Form
* **Action:** Remove the `Status` field from the Edit Product form as requested.
* **Target Modules:** `Account Management`, `Category Management` (Admin)
* **Action:** Review and clean up any incorrect `Status` field usage based on audit findings.

### Task 3: Fix Data Mapping for Edit Forms
* **Target Module:** `Account Management` (Admin)
* **Action:** Ensure `Date of Birth` and `Address` (along with all other object attributes) are correctly mapped and pre-filled when editing an account.
* **Target Modules:** `Product Management`, `Category Management` (Admin)
* **Action:** Audit all fields in Product and Category Edit forms to ensure zero missing attributes.

---

## 3. Strict Scope Checklist

* [ ] **Admin / Account Management**
  * [ ] Investigate & fix data pre-population (`Date of Birth`, `Address`).
  * [ ] Audit `Status` field implementation.
* [ ] **Admin / Product Management**
  * [ ] Investigate & fix click handlers for "Set/Update Price" and "Inactive Product".
  * [ ] Remove `Status` field from the Edit Product form.
* [ ] **Admin / Category Management**
  * [ ] Investigate data mapping on Edit Form.
  * [ ] Audit `Status` field implementation.

> **Reminder:** Do not make changes to non-Admin modules under any circumstances.