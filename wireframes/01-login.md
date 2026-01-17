# Wireframe: Login Page

**Page Name**: Login Page  
**Route**: `/login`  
**Priority**: HIGH  
**Page Type**: Authentication Form  
**Created**: January 17, 2026  
**Status**: Draft

---

## Page Overview

**Purpose**: User authentication entry point for the AI2AIM RX platform  
**User Goals**: 
- Authenticate with email and password
- Access password reset if needed
- Remember login credentials (optional)

**Primary User**: All users (Physician, Pharmacist, Admin, Nurse, Billing, Compliance)

---

## Layout Structure

### Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    [AI2AIM RX Logo]                         │
│                                                              │
│              ┌──────────────────────────────┐               │
│              │                              │               │
│              │     LOGIN FORM               │               │
│              │                              │               │
│              │  Email: [____________]        │               │
│              │                              │               │
│              │  Password: [____________]    │               │
│              │                              │               │
│              │  ☐ Remember me              │               │
│              │                              │               │
│              │  [Forgot password?]          │               │
│              │                              │               │
│              │  [    Sign In    ]          │               │
│              │                              │               │
│              │  [Error message area]       │               │
│              │                              │               │
│              └──────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌─────────────────┐
│                 │
│  [AI2AIM Logo]  │
│                 │
│ ┌─────────────┐ │
│ │             │ │
│ │ Email:      │ │
│ │ [________]  │ │
│ │             │ │
│ │ Password:   │ │
│ │ [________]  │ │
│ │             │ │
│ │ ☐ Remember  │ │
│ │             │ │
│ │ [Forgot?]   │ │
│ │             │ │
│ │ [Sign In]   │ │
│ │             │ │
│ └─────────────┘ │
│                 │
└─────────────────┘
```

---

## Component Breakdown

### Header Section
- [x] Logo/Branding: "AI2AIM RX" centered at top
- [ ] No navigation menu (authentication page)
- [ ] No user menu (not authenticated yet)

### Main Content Area

#### Login Form Card
- [x] Form container (centered card, max-width: 400px)
- [x] Email input field
  - Type: email
  - Placeholder: "Enter your email"
  - Required: Yes
  - Auto-focus on page load
- [x] Password input field
  - Type: password
  - Placeholder: "Enter your password"
  - Required: Yes
  - Show/hide password toggle
- [x] Remember me checkbox
  - Label: "Remember me"
  - Default: Unchecked
- [x] Forgot password link
  - Text: "Forgot password?"
  - Link: `/login/forgot-password` (future)
- [x] Sign In button
  - Type: submit
  - Variant: primary
  - Full width
  - Loading state when submitting
- [x] Error message area
  - Location: Below form
  - Display: Red text
  - Examples: "Invalid email or password", "Account locked"

---

## Interactive Elements

### Buttons
- [x] Primary: "Sign In" - Full width, below form
- [ ] Secondary: None

### Forms
- [x] Email input: Text/Email type - Required
- [x] Password input: Password type - Required
- [x] Checkbox: "Remember me" - Optional

### Links
- [x] "Forgot password?" - Link to password reset (future)

---

## States & Variations

### Default State
- Empty form fields
- Sign In button enabled
- No error messages

### Loading State
- Sign In button shows spinner
- Button text: "Signing in..."
- Button disabled
- Form fields disabled

### Error State
- Error message displayed below form
- Error message in red text
- Form fields remain filled (except password)
- Sign In button re-enabled

### Success State
- Redirects to `/dashboard`
- No on-page success message

### Validation States
- **Email invalid**: Show error "Please enter a valid email address"
- **Password empty**: Show error "Password is required"
- **Email empty**: Show error "Email is required"

---

## Data Requirements

### Data to Collect
- [x] Email: String - Email format validation
- [x] Password: String - Minimum length validation (handled by Supabase)
- [x] Remember me: Boolean - Optional

### API Endpoints
- [x] POST `/api/auth/login` (handled by Supabase Auth)
  - Request: `{ email, password }`
  - Response: `{ user, session }` or error

---

## User Workflows

### Primary Workflow: Successful Login
1. User navigates to `/login`
2. User enters email address
3. User enters password
4. User optionally checks "Remember me"
5. User clicks "Sign In"
6. System validates credentials
7. System creates session
8. System redirects to `/dashboard`

### Alternative Workflow: Invalid Credentials
1. User enters credentials
2. User clicks "Sign In"
3. System validates and finds invalid credentials
4. System displays error: "Invalid email or password"
5. User corrects credentials and retries

### Alternative Workflow: Forgot Password
1. User clicks "Forgot password?" link
2. System navigates to password reset page (future)

---

## Accessibility Requirements

- [x] All form fields have associated labels
- [x] Email field has `autocomplete="email"`
- [x] Password field has `autocomplete="current-password"`
- [x] Form has proper ARIA labels
- [x] Error messages are associated with form fields
- [x] Focus order: Email → Password → Remember me → Sign In
- [x] Keyboard navigation fully functional
- [x] Color contrast meets WCAG 2.1 AA (4.5:1)
- [x] Focus indicators visible on all interactive elements

---

## Responsive Breakpoints

- [x] Mobile (< 768px): 
  - Full-width form
  - Stacked layout
  - Touch-friendly button sizes (min 44x44px)
- [x] Tablet (768px - 1024px): 
  - Centered form (max-width: 400px)
  - Same as desktop
- [x] Desktop (> 1024px): 
  - Centered form (max-width: 400px)
  - More vertical spacing

---

## Design System References

### Components Used
- [x] Input (shadcn/ui) - Email and password fields
- [x] Button (shadcn/ui) - Sign In button
- [x] Checkbox (shadcn/ui) - Remember me
- [x] Card (shadcn/ui) - Form container (optional)

### Colors
- Primary: Blue (for Sign In button)
- Error: Red (for error messages)
- Text: Gray-900 (for labels and text)

### Typography
- Heading: "AI2AIM RX" - Large, bold
- Labels: Medium weight
- Error text: Small, red

---

## Notes & Considerations

- Form should be centered both horizontally and vertically
- Logo should be prominent but not overwhelming
- Error messages should be clear and actionable
- Password field should have show/hide toggle for better UX
- Consider adding "Sign in with Google" option in future
- Remember me should set longer session expiration
- Should handle account lockout after multiple failed attempts

---

## Approval

- [ ] Design Review: [Name] - [Date]
- [ ] Stakeholder Approval: [Name] - [Date]
- [ ] Development Ready: [Date]

---

**Wireframe Version**: 1.0  
**Last Updated**: January 17, 2026
