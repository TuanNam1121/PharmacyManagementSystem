# Requirement Specification: Decoupling Assign Role into a Dedicated Modal

## 1. Overview & Context

This requirement specifies a design and workflow change in the User Management system. 

Currently, the **Assign Role** feature is embedded inside the `Add User` and `Update User` forms/screens. Under the updated specification:
1. Roles will **no longer** be selected or assigned during user creation or direct profile editing.
2. Newly created users will initially have **no role** assigned.
3. Role assignment is moved into its own dedicated **"Assign Role"** action button alongside existing user action options (`View`, `Edit`, `Lock`).
4. Role assignment will be handled via an **interactive modal popup** written in English.
5. The popup will dynamically display a **list of associated permissions** whenever a specific role is selected, allowing the administrator to review permissions before saving.

---

## 2. Summary of Changes

| Area | Current Implementation | New Proposed Implementation |
| :--- | :--- | :--- |
| **Add User Form** | Contains a required/optional `Role` dropdown | **Remove `Role` field.** User is created without any assigned role. |
| **Edit/Update User Form** | Contains a `Role` field to modify existing roles | **Remove `Role` field.** User attributes (Name, Email, Phone, Status) are updated separately. |
| **User Action List** | Actions: `View`, `Edit`, `Lock` | Actions: `View`, `Edit`, **`Assign Role`**, `Lock` |
| **Role Assignment Interface** | Embedded within user forms | **Dedicated Modal Popup** triggered by the `Assign Role` action. |
| **Role Selection Behavior** | Static dropdown or checklist | Selecting a Role dynamically updates and displays the list of permissions associated with that role. |

---

## 3. Detailed Technical Requirements

### 3.1 Form Modifications
* **Add User Form (`UC07`)**:
  * Remove the **Assign Role** input/select box.
  * Validation: On submit, the system creates the user entity with a `Role` state of `Unassigned` / `None`.
* **Update User Form (`UC08`)**:
  * Remove the **Assign Role** input/select box.

### 3.2 Action Menu Update
* Add an action button/icon labeled **"Assign Role"** in the action column of the User List table, positioned alongside `View`, `Edit`, and `Lock`.

---

## 4. UI/UX Specification: Assign Role Modal Popup

### 4.1 Design & Styling Guidelines
* **Modal Aesthetics:** Matches the clean, modern CSS styling of the existing `View`, `Edit`, and `Lock` modals (rounded corners, standard overlay backdrop, consistent typography, responsive padding, shadow effects, and action buttons).
* **Language:** English (`EN`).

### 4.2 Layout Structure
1. **Header:**
   * Title: `Assign Role - [User Full Name]` (e.g., *Assign Role - John Doe*)
   * Close `X` button in top right.
2. **Body:**
   * **Target User Info (Read-only):** Display basic details like Username/Email to confirm context.
   * **Role Selector:** Dropdown menu or radio group labeled **"Select Role"**.
     * Default state: `-- Select a Role --`
     * Options: List of active system roles (e.g., `Administrator`, `Store Manager`, `Pharmacist`, `Warehouse Manager`, `Purchasing Staff`, `Warehouse Staff`, `General Manager`).
   * **Permissions Preview Area:**
     * Sub-header: **"Permissions Summary"**
     * Dynamic Panel/List: When a user selects a role from the dropdown, this area displays the specific granular permissions included under that role (e.g., *View Inventory*, *Approve Purchase Orders*, *Create Invoices*).
     * Empty state (when no role is chosen): *"Please select a role to view its associated permissions."*
3. **Footer:**
   * **Cancel Button:** Secondary button style; closes modal without saving changes.
   * **Save / Apply Button:** Primary button style; saves the selected role to the user entity.

---

## 5. Workflow & Business Logic

```
[Admin clicks "Assign Role" in User List Table]
                       │
                       ▼
            [Open "Assign Role" Modal]
                       │
                       ▼
            [Admin selects a Role]
                       │
                       ▼
  [System displays Permission List for selected Role]
                       │
                       ▼
          [Admin clicks "Save Role"]
                       │
                       ▼
 [System updates User Role -> Shows Success Toast Notification -> Closes Modal]
```

1. Admin clicks **"Assign Role"** on a user in the table.
2. Modal opens fetching current user data.
3. Admin picks a role from **"Select Role"**.
4. The system renders the permissions associated with that role below the selector.
5. Admin verifies permissions and clicks **"Save Changes"**.
6. System calls the API to assign the role, displays a success notification (`"Role successfully assigned to [User Name]"`), and closes the modal.